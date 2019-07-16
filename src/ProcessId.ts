import { ObjectId } from 'bson'

export const currentProcessId = new ObjectId().toHexString()
