import { mockWorld } from './World'

type Real = typeof import('../DataStore')

export const beginTaskResolution: Real['beginTaskResolution'] = async (
  todoUniqueKey,
  repositoryId,
) => {
  const existing = mockWorld.store.find(entry => entry._id === todoUniqueKey)
  if (existing) {
    return { existingTaskReference: existing.reference }
  }

  return {
    async acquireTaskCreationLock() {
      return {
        async finish(taskReference, state) {
          mockWorld.store.push({
            _id: todoUniqueKey,
            reference: taskReference,
            state: state,
            completed: false,
          })
        },
      }
    },
  }
}

export const findAllUncompletedTasks: Real['findAllUncompletedTasks'] = async repositoryId => {
  return mockWorld.store
    .filter(entry => !entry.completed)
    .map(entry => {
      return {
        taskReference: entry.reference,
        state: entry.state,
        async markAsCompleted() {
          entry.completed = true
        },
        async updateState(newState) {
          entry.state = newState
        },
      }
    })
}
