import { invariant } from 'tkt'
import { logger } from 'tkt'
import { ObjectId } from 'bson'

import * as TaskUpdater from './TaskUpdater'
import * as CodeRepository from './CodeRepository'

const log = logger('main')

export async function runMain() {
  log.info('Search for files with TODO tags...')
  const {
    todoComments,
    saveChanges,
  } = await CodeRepository.scanCodeRepository()
  log.info('Total TODOs found: %s', todoComments.length)
  const todosWithoutReference = todoComments.filter(todo => !todo.reference)
  log.info('TODOs without references: %s', todosWithoutReference.length)

  // TODO [$5d2df603d0b2e60007407250]: Stop if not default branch.

  if (todosWithoutReference.length > 0) {
    for (const todo of todosWithoutReference) {
      todo.reference = `$${new ObjectId().toHexString()}`
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
  await TaskUpdater.ensureAllTodosAreAssociated(todoComments)
  await saveChanges('Update TODO references')

  // Reconcile all tasks
  await TaskUpdater.reconcileTasks(todoComments)
}
