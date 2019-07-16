import { logger, invariant } from 'tkt'
import { ITodo, ITaskState } from './types'
import { ObjectId } from 'mongodb'

import { getMongoDb } from './MongoDB'
import { currentProcessId } from './ProcessId'

const log = logger('DataStore')

type TaskResolutionProcedure =
  | { existingTaskReference: string }
  | { acquireTaskCreationLock(): Promise<TaskCreationLock> }

type TaskCreationLock = {
  finish(taskReference: string): Promise<void>
}

export async function beginTaskResolution(
  todoUniqueKey: string,
  repositoryId: string,
  todo: ITodo,
): Promise<TaskResolutionProcedure> {
  const db = await getMongoDb()
  const _id = ObjectId.createFromHexString(todoUniqueKey)

  // Ensure a task exists in the database.
  const task = await db.tasks.findOneAndUpdate(
    { _id: _id },
    {
      $setOnInsert: {
        _id: _id,
        repositoryId: repositoryId,
        taskReference: null,
        createdAt: new Date(),
        ownerProcessId: null,
        ownerProcessTimestamp: null,
      },
    },
    { upsert: true, returnOriginal: false },
  )
  if (!task.value) {
    throw new Error('Failed to upsert a task.')
  }
  if (task.value.taskReference) {
    log.debug(
      'Found already-existing identifier %s for TODO %s.',
      task.value.taskReference,
      todoUniqueKey,
    )
    return { existingTaskReference: task.value.taskReference }
  }

  return {
    async acquireTaskCreationLock() {
      // Acquire a lock...
      log.debug(
        'Acquiring lock for TODO %s (currentProcessId=%s).',
        todoUniqueKey,
        currentProcessId,
      )
      const lockedTask = await db.tasks.findOneAndUpdate(
        {
          _id: _id,
          $or: [
            { ownerProcessTimestamp: null },
            { ownerProcessTimestamp: { $lt: new Date(Date.now() - 60e3) } },
          ],
        },
        {
          $set: {
            ownerProcessId: currentProcessId,
            ownerProcessTimestamp: new Date(),
          },
        },
        { returnOriginal: false },
      )
      if (!lockedTask.value) {
        throw new Error('Failed to acquire a lock for this task.')
      }
      return {
        async finish(taskReference) {
          // Associate
          log.debug(
            'Created task %s for TODO %s. Saving changes.',
            taskReference,
            todoUniqueKey,
          )
          await db.tasks.findOneAndUpdate(
            { _id: _id },
            { $set: { taskReference: taskReference } },
          )
        },
      }
    },
  }
}

type Task = {
  taskReference: string
  state: ITaskState
  markAsCompleted(): Promise<void>
  updateState(newState: ITaskState): Promise<void>
}

export async function findAllUncompletedTasks(
  repositoryId: string,
): Promise<Task[]> {
  const db = await getMongoDb()
  const result = await db.tasks
    .find({
      repositoryId: repositoryId,
      completed: { $ne: true },
      taskReference: { $ne: null },
    })
    .toArray()

  return result.map(taskData => {
    return {
      taskReference:
        taskData.taskReference ||
        invariant(false, 'Unexpected unassociated task.'),
      state: {
        hash: taskData.hash || '',
      },
      async markAsCompleted() {
        await db.tasks.findOneAndUpdate(
          { _id: taskData._id },
          { $set: { completed: true } },
        )
      },
      async updateState(newState) {
        await db.tasks.findOneAndUpdate(
          { _id: taskData._id },
          { $set: { hash: newState.hash } },
        )
      },
    } as Task
  })
}
