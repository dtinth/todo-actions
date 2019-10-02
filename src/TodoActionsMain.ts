import { invariant } from 'tkt'
import { logger } from 'tkt'
import { ObjectId } from 'bson'
import { ITodo } from './types'

import * as TodoParser from './TodoParser'
import * as TaskUpdater from './TaskUpdater'
import * as CodeRepository from './CodeRepository'

const log = logger('main')

export async function runMain() {
  log.info('Search for files with TODO tags...')
  const { files, saveChanges } = await CodeRepository.scanCodeRepository()

  const todoComments: ITodo[] = []
  for (const file of files) {
    // TODO [#22]: Implement ignoring paths
    if (file.fileName === 'README.md') continue
    const todos = TodoParser.parseTodos(file)
    log.info('%s: %s found', file.fileName, todos.length)
    todoComments.push(...todos)
  }

  log.info('Total TODOs found: %s', todoComments.length)
  const todosWithoutReference = todoComments.filter(todo => !todo.reference)
  log.info('TODOs without references: %s', todosWithoutReference.length)

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
  const associated = await TaskUpdater.ensureAllTodosAreAssociated(todoComments)
  await saveChanges('Update TODO references: ' + associated.join(', '))

  // Reconcile all tasks
  await TaskUpdater.reconcileTasks(todoComments)
}
