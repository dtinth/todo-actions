import { IFile, ITaskState } from '../types'
import { MockFile } from '../File'

export let mockWorld: MockWorld

export type MockTask = {
  title: string
  body: string
  number: number
  completed: boolean
}

export type MockDataStoreEntry = {
  _id: string
  completed: boolean
  reference: string
  state: ITaskState
}

export type MockCommit = {
  message: string
  files: Map<string, string>
}

export function resetMockWorld() {
  mockWorld = new MockWorld()
  return mockWorld
}

class MockWorld {
  files: Map<string, IFile> = new Map()
  branch = 'master'
  store: MockDataStoreEntry[] = []
  tasks: MockTask[] = []
  commits: MockCommit[] = []

  file(fileName: string, contents: string) {
    this.files.set(fileName, new MockFile(fileName, contents))
  }
}
