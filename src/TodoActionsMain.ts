import { invariant } from 'tkt'
import { execSync, execFileSync } from 'child_process'
import { updateTasks } from './TaskUpdater'
import { logger } from 'tkt'
import { scanCodeRepository } from './CodeRepository'
import { IFile } from './types'

const log = logger('main')

export async function runMain() {
  log.info('Search for files with TODO tags...')
  const { todoComments, saveChanges } = await scanCodeRepository()
  log.info('Total TODOs found: %s', todoComments.length)
  const todosWithoutReference = todoComments.filter(todo => !todo.reference)
  log.info('TODOs without references: %s', todosWithoutReference.length)
  // TODO [#2]: Stop if not default branch.
  if (todosWithoutReference.length > 0) {
    for (const todo of todosWithoutReference) {
      todo.reference = `$${require('bson-objectid').default.generate()}`
    }
    await saveChanges('Collect TODO comments')
  }
  // Every TODO must have a reference by now.
  for (const todo of todoComments) {
    invariant(
      todo.reference,
      'TODO "%s" at %s must have a reference by now!',
      todo.title,
      todo.file.fileName,
    )
  }
  // Update all the tasks according to the TODO state.
  await updateTasks(todoComments)
  await saveChanges('Update TODO references')
}
