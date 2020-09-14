import { getInput } from '@actions/core'
import { ITodo, ITaskState } from './types'
import { createHash } from 'crypto'
import { repoContext } from './CodeRepository'
import { invariant, logger } from 'tkt'
import { graphql } from '@octokit/graphql'

type TaskInformation = {
  state: ITaskState
  title: string
  body: string
}

const owner = repoContext.repositoryOwner
const repo = repoContext.repositoryName
const branch = getInput('branch') || repoContext.defaultBranch

const log = logger('TaskInformationGenerator')

let cache = 'meh'
async function fetchCommit(): Promise<string> {
  if (cache !== 'meh') {
    return cache
  }

  // Some random check to filter out tests
  if (!('GITHUB_TOKEN' in process.env)) {
    log.info(`Skipping local testing env`)
    return ''
  }

  cache = ''

  log.info('Fetching commit')
  try {
    const { repository: { ref: { target: { history: { nodes: [{ oid }] } } } } } = await graphql(`{
      repository(name: "${repo}", owner: "${owner}") {
        ref(qualifiedName: "${branch}") {
          target {
            ... on Commit {
              history(first: 1) {
                nodes {
                  oid
                }
              }
            }
          }
        }
      }
    }`, {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN ||
          invariant(false, 'Required GITHUB_TOKEN variable.')}`,
      },
    })

    cache = oid
  } catch (err) {
    console.error(err)
  }

  return cache
}

export async function generateTaskInformationFromTodo(todo: ITodo): Promise<TaskInformation> {
  const title = todo.title

  const file = todo.file.fileName
  // TODO [#31]: Also link to end line in addition to just the starting line.
  // This requires changing `IFile` interface and `File` class to also keep track of where the TODO comment ends.
  const line = todo.startLine
  const commit = await fetchCommit()
  log.info(`last commit: '${commit}'`)

  const url = `https://github.com/${owner}/${repo}/blob/${commit || branch}/${file}#L${line}`
  const link = `[${file}:${line}](${url})`
  const body = [
    todo.body,
    '',
    '---',
    `_` +
      `This issue has been automatically created by [todo-actions](https://github.com/apps/todo-actions) based on a TODO comment found in ${link}. ` +
      `It will automatically be closed when the TODO comment is removed from ${branch}.` +
      `_`,
  ].join('\n')

  return {
    state: {
      hash: createHash('md5')
        .update(title)
        .update(body)
        .digest('hex'),
    },
    title,
    body,
  }
}
