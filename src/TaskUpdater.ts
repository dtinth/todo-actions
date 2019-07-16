import { invariant, logger } from 'tkt'
import { ITodo } from './types'

import * as CodeRepository from './CodeRepository'
import * as TaskManagementSystem from './TaskManagementSystem'
import * as DataStore from './DataStore'

const log = logger('TaskUpdater')

export async function ensureAllTodosAreAssociated(todos: ITodo[]) {
  for (const todo of todos) {
    const reference =
      todo.reference || invariant(false, 'Unexpected unidentified TODO marker')
    const unassociated = reference.startsWith('$')
    if (unassociated) {
      const todoUniqueKey = reference.substr(1)
      log.debug('Found unresolved TODO %s, resolving task...', todoUniqueKey)
      const taskReference = await resolveTask(todoUniqueKey, todo)
      log.debug('Resolved TODO %s => task %s', todoUniqueKey, taskReference)
      todo.reference = taskReference
    }
  }
}

export async function reconcileTasks(todos: ITodo[]) {
  const allOpenTasks = await DataStore.findAllUncompletedTasks(
    CodeRepository.repoContext.repositoryNodeId,
  )

  for (const todo of todos) {
    const reference =
      todo.reference || invariant(false, 'Unexpected unidentified TODO marker')
    invariant(
      !reference.startsWith('$'),
      'Expected all TODO comments to be associated by now.',
    )
    const task = allOpenTasks.find(t => t.taskReference === reference)
    if (!task) {
      log.warn(
        'Cannot find a matching task for TODO comment with reference "%s"',
        reference,
      )
      continue
    }
    // TODO [#25]: Check if the task state changed.
    // TODO [#26]: Generate the task body.
    // TODO [#27]: Update the task body if changed.
  }

  // TODO [#28]: Complete tasks whose TODO comments are no longer present.
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
  if ('existingTaskReference' in resolution) {
    return resolution.existingTaskReference
  }
  const taskCreationLock = await resolution.acquireTaskCreationLock()
  log.debug('Lock acquired. Now creating task for TODO %s.', todoUniqueKey)
  const taskReference = await TaskManagementSystem.createTask(todo)
  taskCreationLock.finish(taskReference)
  return taskReference
}
