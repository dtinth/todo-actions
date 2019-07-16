import { invariant, logger } from 'tkt'
import { ITodo } from './types'

import * as CodeRepository from './CodeRepository'
import * as TaskManagementSystem from './TaskManagementSystem'
import * as DataStore from './DataStore'

const log = logger('TaskUpdater')

export async function ensureAllTodosAreAssociated(todos: ITodo[]) {
  for (const todo of todos) {
    const reference =
      todo.reference ||
      invariant(false, 'Unexpected TODO without reference encountered')
    const unassociated = reference.startsWith('$')
    if (unassociated) {
      const todoUniqueKey = reference.substr(1)
      log.debug('Found unresolved TODO %s, resolving task...', todoUniqueKey)
      const taskIdentifier = await resolveTask(todoUniqueKey, todo)
      log.debug('Resolved TODO %s => task %s', todoUniqueKey, taskIdentifier)
      todo.reference = taskIdentifier
    } else {
      // TODO [#5]: Generate the task body.
      // TODO [#6]: Update the task body if changed.
    }
  }

  // TODO [#7]: Complete tasks whose TODO comments are no longer present.
}

export async function resolveTask(
  todoUniqueKey: string,
  todo: ITodo,
): Promise<string> {
  const resolution = await DataStore.beginTaskResolution(
    todoUniqueKey,
    CodeRepository.repoContext.repositoryNodeId,
    todo,
  )
  if ('existingTaskIdentifier' in resolution) {
    return resolution.existingTaskIdentifier
  }
  const taskCreationLock = await resolution.acquireTaskCreationLock()
  log.debug('Lock acquired. Now creating task for TODO %s.', todoUniqueKey)
  const taskIdentifier = await TaskManagementSystem.createTask(todo)
  taskCreationLock.finish(taskIdentifier)
  return taskIdentifier
}
