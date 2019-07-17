type Real = typeof import('../CodeRepository')

export const repoContext: Real['repoContext'] = {
  repositoryNodeId: '__GITHUB_REPO_NODE_ID__',
  repositoryOwner: '_dtinth',
  repositoryName: '_todo-actions',
  defaultBranch: 'master',
}

export const scanCodeRepository: Real['scanCodeRepository'] = async () => {
  throw new Error('!!!')
}
