import { invariant, logger } from 'tkt'
import { ITodo } from './types'

import * as CodeRepository from './CodeRepository'
import * as TaskManagementSystem from './TaskManagementSystem'
import * as DataStore from './DataStore'
import * as TaskInformationGenerator from './TaskInformationGenerator'

const log = logger('TaskUpdater')

export async function ensureAllTodosAreAssociated(todos: ITodo[]) {
  const references: string[] = []
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
      references.push(taskReference)
    }
  }
  return references
}

export async function reconcileTasks(todos: ITodo[]) {
  const uncompletedTasks = await DataStore.findAllUncompletedTasks(
    CodeRepository.repoContext.repositoryNodeId,
  )
  log.info(
    'Number of registered uncompleted tasks: %s',
    uncompletedTasks.length,
  )

  for (const todo of todos) {
    const reference =
      todo.reference || invariant(false, 'Unexpected unidentified TODO marker')
    invariant(
      !reference.startsWith('$'),
      'Expected all TODO comments to be associated by now.',
    )
    const task = uncompletedTasks.find(t => t.taskReference === reference)
    if (!task) {
      log.warn(
        'Cannot find a matching task for TODO comment with reference "%s"',
        reference,
      )
      continue
    }
    const {
      title,
      body,
      state,
    } = TaskInformationGenerator.generateTaskInformationFromTodo(todo)
    if (task.state.hash !== state.hash) {
      log.info(
        'Hash for "%s" changed: "%s" => "%s" -- must update task.',
        reference,
        task.state.hash,
        state.hash,
      )
      await TaskManagementSystem.updateTask(reference, { title, body })
      await task.updateState(state)
    } else {
      log.info(
        'Hash for "%s" remains unchanged: "%s".',
        reference,
        task.state.hash,
      )
    }
  }

  for (const task of uncompletedTasks) {
    if (todos.find(todo => todo.reference === task.taskReference)) continue
    log.info(
      'TODO for task "%s" is gone -- completing task!',
      task.taskReference,
    )
    await TaskManagementSystem.completeTask(task.taskReference)
    await task.markAsCompleted()
  }
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
  const {
    title,
    body,
    state,
  } = TaskInformationGenerator.generateTaskInformationFromTodo(todo)
  const taskReference = await TaskManagementSystem.createTask({ title, body })
  taskCreationLock.finish(taskReference, state)
  return taskReference
}
