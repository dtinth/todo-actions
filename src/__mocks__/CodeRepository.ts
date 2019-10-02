import { mockWorld } from './World'

type Real = typeof import('../CodeRepository')

export const repoContext: Real['repoContext'] = {
  repositoryNodeId: '__GITHUB_REPO_NODE_ID__',
  repositoryOwner: '_dtinth',
  repositoryName: '_todo-actions',
  defaultBranch: 'master',
}

export const scanCodeRepository: Real['scanCodeRepository'] = async () => {
  const files = [...mockWorld.files.values()]
  return {
    files: files,
    async saveChanges(commitMessage) {
      if (!files.some(f => f.contents.changed)) return
      files.forEach(f => f.save())
      mockWorld.commits.push({
        message: commitMessage,
        files: new Map(files.map(f => [f.fileName, f.contents.toString()])),
      })
    },
  }
}
