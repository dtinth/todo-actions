import { mockWorld } from './World'

type Real = typeof import('../CodeRepository')

export const repoContext: Real['repoContext'] = {
  repositoryNodeId: '__GITHUB_REPO_NODE_ID__',
  repositoryOwner: '_dtinth',
  repositoryName: '_todo-actions',
  defaultBranch: 'master',
}

export const scanCodeRepository: Real['scanCodeRepository'] = async () => {
  return {
    files: [...mockWorld.files.values()],
    isOnDefaultBranch: mockWorld.branch === repoContext.defaultBranch,
    async saveChanges(commitMessage) {
      if (![...mockWorld.files.values()].some(f => f.contents.changed)) return
      mockWorld.commits.push({
        message: commitMessage,
        files: new Map(
          [...mockWorld.files.values()].map(f => [
            f.fileName,
            f.contents.toString(),
          ]),
        ),
      })
    },
  }
}
