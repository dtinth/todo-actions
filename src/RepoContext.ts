import { existsSync, readFileSync } from 'fs'
import { logger, invariant } from 'tkt'

const log = logger('RepoContext')

const event =
  process.env.GITHUB_EVENT_PATH && existsSync(process.env.GITHUB_EVENT_PATH)
    ? (log.debug('Found GitHub Action event file'),
      JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')))
    : (log.debug('No GitHub Action event file found'), null)

export const repoContext = {
  repositoryNodeId:
    process.env.GITHUB_REPO_NODE_ID ||
    (event && event.repository && event.repository.node_id) ||
    invariant(
      false,
      'GitHub Repo Node ID not found, either in GitHub Action event payload and GITHUB_REPO_NODE_ID environment variable.',
    ),
}
