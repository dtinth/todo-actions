import { logger } from 'tkt'
import { ITodo } from './types'
import { getMongoDb } from './MongoDB'
import { ObjectId } from 'mongodb'
import { currentProcessId } from './ProcessId'

const log = logger('DataStore')

type TaskResolutionProcedure =
  | { existingTaskIdentifier: string }
  | { acquireTaskCreationLock(): Promise<TaskCreationLock> }

type TaskCreationLock = {
  finish(taskIdentifier: string): Promise<void>
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
        taskIdentifier: null,
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
  if (task.value.taskIdentifier) {
    log.debug(
      'Found already-existing identifier %s for TODO %s.',
      task.value.taskIdentifier,
      todoUniqueKey,
    )
    return { existingTaskIdentifier: task.value.taskIdentifier }
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
        async finish(taskIdentifier) {
          // Associate
          log.debug(
            'Created task %s for TODO %s. Saving changes.',
            taskIdentifier,
            todoUniqueKey,
          )
          await db.tasks.findOneAndUpdate(
            { _id: _id },
            { $set: { taskIdentifier: taskIdentifier } },
          )
        },
      }
    },
  }
}
