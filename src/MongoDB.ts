import { Collection, ObjectId } from 'mongodb'
import { invariant, logger } from 'tkt'

type TaskSchema = {
  /**
   * Globally-unique ID for the task.
   */
  _id: ObjectId

  /**
   * String identifying the repository.
   * This should be stable, i.e. does not change even though project is renamed.
   */
  repositoryId: string

  /**
   * The identifier of the associated task.
   */
  taskIdentifier: string | null

  /**
   * When the task is created.
   */
  createdAt: Date

  /**
   * ID of the process creating it.
   */
  ownerProcessId: string | null

  /**
   * Timestamp at which the lock was acquired.
   */
  ownerProcessTimestamp: Date | null
}

let mongoPromise: Promise<{
  tasks: Collection<TaskSchema>
}>

const log = logger('mongo')

export async function getMongoDb() {
  if (mongoPromise) return mongoPromise
  return (mongoPromise = (async () => {
    const { MongoClient } = await import('mongodb')
    log.info('Connecting...')

    const client = new MongoClient(
      process.env.TODO_ACTIONS_MONGO_URL ||
        invariant(
          false,
          'Missing environment variable: TODO_ACTIONS_MONGO_URL',
        ),
    )
    await client.connect()
    log.info('Connected!')

    const db = client.db()
    const tasks = db.collection<TaskSchema>('tasks')

    return {
      tasks: tasks,
    }
  })())
}
