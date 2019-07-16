import { MongoClient } from 'mongodb'
import { invariant } from 'tkt'

let mongoClientPromise: Promise<MongoClient>

export async function getMongoClient() {
  if (mongoClientPromise) return mongoClientPromise
  return (mongoClientPromise = (async () => {
    const { MongoClient } = await import('mongodb')
    const client = new MongoClient(
      process.env.TODO_ACTIONS_MONGO_URL ||
        invariant(
          false,
          'Missing environment variable: TODO_ACTIONS_MONGO_URL',
        ),
    )
    return client.connect()
  })())
}
