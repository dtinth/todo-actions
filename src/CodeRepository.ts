import { existsSync, readFileSync } from 'fs'
import { logger, invariant } from 'tkt'
import { execSync, execFileSync } from 'child_process'
import { File } from './File'
import { parseTodos } from './TodoParser'
import { ITodo, IFile } from './types'

const log = logger('CodeRepository')

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

type CodeRepository = {
  todoComments: ITodo[]
  files: IFile[]
  saveChanges(commitMessage: string): Promise<void>
}

export async function scanCodeRepository(): Promise<CodeRepository> {
  log.info('Search for files with TODO tags...')
  const filesWithTodoMarker = execSync('git grep -Il TODO', {
    encoding: 'utf8',
  })
    .split('\n')
    .filter(name => name)

  const todoComments = []
  const files: IFile[] = []
  log.info('Parsing TODO tags...')
  for (const filePath of filesWithTodoMarker) {
    // TODO [#1]: Implement ignoring paths
    if (filePath === 'README.md') continue
    const file = new File(filePath)
    const todos = parseTodos(file)
    log.info('%s: %s found', filePath, todos.length)
    todoComments.push(...todos)
    files.push(file)
  }
  return {
    todoComments,
    files,
    async saveChanges(commitMessage) {
      const changedFiles = files.filter(file => file.contents.changed)
      log.info('Files changed: %s', changedFiles.length)
      if (changedFiles.length === 0) {
        return
      }
      for (const file of changedFiles) {
        file.save()
      }
      execFileSync('git', ['add', ...changedFiles.map(file => file.fileName)])
      execFileSync('git', ['commit', '-m', commitMessage], {
        stdio: 'inherit',
      })
      if (!process.env.GITHUB_TOKEN) {
        throw `Maybe you forgot to enable the GITHUB_TOKEN secret?`
      }
      execSync('git push origin $(git rev-parse --abbrev-ref HEAD)', {
        stdio: 'inherit',
      })
    },
  }
}
