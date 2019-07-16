import { invariant } from 'tkt'
import { ITodo } from './types'
import { getMongoClient } from './MongoDB'

export async function updateTasks(todos: ITodo[]) {
  for (const todo of todos) {
    const reference =
      todo.reference ||
      invariant(false, 'Unexpected TODO without reference encountered')
    const unresolved = reference.startsWith('$')
    if (unresolved) {
      const todoUniqueKey = reference.substr(1)
      const task = resolveTask(todoUniqueKey)
    } else {
      // TODO [$5d239d6f029ffa0007ca8a0a]: Generate the issue text.
      // TODO [$5d239d6f029ffa0007ca8a0b]: Update the issue if changed.
    }
  }

  // TODO [$5d239d6f029ffa0007ca8a0c]: Create a commit if some todos have been resolved to issue.
}

export async function resolveTask() {
  const tasks = await getTasksCollection()
}

async function getTasksCollection() {
  const client = await getMongoClient()
  const tasks = client.db().collection<{
    /**
     * String identifying the project.
     * This should be stable, i.e. does not change even though project is renamed.
     */
    projectId: string

    /**
     * The unique reference key for the TODO item.
     */
    uniqueKey: string
  }>('tasks')
  await tasks.createIndex({ projectId: 1, uniqueKey: 1 }, { unique: true })
  // TODO [$5d239d6f029ffa0007ca8a06]: Acquire a lock for TODO’s key.
  // TODO [$5d239d6f029ffa0007ca8a07]: Create an issue.
  // TODO [$5d239d6f029ffa0007ca8a08]: Associate the issue reference (resolution) to the TODO’s unique key.
  // TODO [$5d239d6f029ffa0007ca8a09]: Update the TODO reference to the resolved key.
}
