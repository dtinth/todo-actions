type Real = typeof import('../DataStore')

export const beginTaskResolution: Real['beginTaskResolution'] = async (
  todoUniqueKey,
  repositoryId,
) => {
  throw new Error('!!!')
  // log.debug(
  //   'Found already-existing identifier %s for TODO %s.',
  //   task.value.taskReference,
  //   todoUniqueKey,
  // )
  // return { existingTaskReference: task.value.taskReference }

  return {
    async acquireTaskCreationLock() {
      return {
        async finish(taskReference, state) {},
      }
    },
  }
}

export const findAllUncompletedTasks: Real['findAllUncompletedTasks'] = async repositoryId => {
  throw new Error('!!!')
}
