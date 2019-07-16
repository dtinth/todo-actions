import { invariant, logger } from 'tkt'
import { ITodo } from './types'
import { getMongoDb } from './MongoDB'
import { repoContext } from './CodeRepository'
import { ObjectId } from 'bson'
import { currentProcessId } from './ProcessId'

const log = logger('TaskUpdater')

export async function updateTasks(todos: ITodo[]) {
  for (const todo of todos) {
    const reference =
      todo.reference ||
      invariant(false, 'Unexpected TODO without reference encountered')
    const unresolved = reference.startsWith('$')
    if (unresolved) {
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
  const db = await getMongoDb()
  const _id = ObjectId.createFromHexString(todoUniqueKey)

  // Ensure a task exists.
  const task = await db.tasks.findOneAndUpdate(
    { _id: _id },
    {
      $setOnInsert: {
        _id: _id,
        projectId: repoContext.repositoryNodeId,
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
    return task.value.taskIdentifier
  }

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

  // Obtain a task identifier
  log.debug('Lock acquired. Now creating task for TODO %s.', todoUniqueKey)
  const taskIdentifier = await createTask(todo)

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

  return taskIdentifier
}

async function createTask(todo: ITodo): Promise<string> {
  const graphql = require('@octokit/graphql').defaults({
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN ||
        invariant(false, 'Required GITHUB_TOKEN variable.')}`,
    },
  })
  const result = await graphql(
    `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) {
          issue {
            number
          }
        }
      }
    `,
    {
      input: {
        repositoryId: repoContext.repositoryNodeId,
        title: todo.title,
        // TODO [#8]: Properly generate the initial issue body.
        body: todo.body,
      },
    },
  )
  log.debug('Result:', result)
  return result.createIssue.issue.number
    ? `#${result.createIssue.issue.number}`
    : invariant(
        false,
        'Failed to get issue number out of createIssue API call.',
      )
}
