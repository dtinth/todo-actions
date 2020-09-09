import { getInput } from '@actions/core'
import { ITodo, ITaskState } from './types'
import { createHash } from 'crypto'
import { repoContext } from './CodeRepository'
import { invariant } from 'tkt'

const graphql = require('@octokit/graphql').defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN ||
      invariant(false, 'Required GITHUB_TOKEN variable.')}`,
  },
})

type TaskInformation = {
  state: ITaskState
  title: string
  body: string
}

const owner = repoContext.repositoryOwner
const repo = repoContext.repositoryName
const branch = getInput('branch') || repoContext.defaultBranch

const commitPromise = Promise.resolve().then(async () => {
  let commit 
  try {
    const { data: { repository: { ref: { target: { history: { nodes: [{ oid }] } } } } } } = await graphql(`{
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
    }`)

    commit = oid
  } catch {}

  return commit
})

export async function generateTaskInformationFromTodo(todo: ITodo): TaskInformation {
  const title = todo.title

  const file = todo.file.fileName
  // TODO [#31]: Also link to end line in addition to just the starting line.
  // This requires changing `IFile` interface and `File` class to also keep track of where the TODO comment ends.
  const line = todo.startLine
  const commit = await commitPromise

  const url = `https://github.com/${owner}/${repo}/blob/${commit || branch}/${file}#L${line}`
  const link = `[${file}:${line}](${url})`
  const body = [
    todo.body,
    '',
    '---',
    `_` +
      `This issue has been automatically created by [todo-actions](https://github.com/apps/todo-actions) based on a TODO comment found in ${link}. ` +
      `It will automatically be closed when the TODO comment is removed from the default branch (${defaultBranch}).` +
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
