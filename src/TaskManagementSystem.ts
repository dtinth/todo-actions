import { invariant, logger } from 'tkt'
import { ITodo } from './types'

import * as CodeRepository from './CodeRepository'

const log = logger('TaskManagementSystem')

export async function createTask(todo: ITodo): Promise<string> {
  const graphql = require('@octokit/graphql').defaults({
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN ||
        invariant(false, 'Required GITHUB_TOKEN variable.')}`,
    },
  })
  const result = await graphql(
    `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) {
          issue {
            number
          }
        }
      }
    `,
    {
      input: {
        repositoryId: CodeRepository.repoContext.repositoryNodeId,
        title: todo.title,
        // TODO [#24]: Properly generate the initial issue body.
        body: todo.body,
      },
    },
  )
  log.debug('Result:', result)
  return result.createIssue.issue.number
    ? `#${result.createIssue.issue.number}`
    : invariant(
        false,
        'Failed to get issue number out of createIssue API call.',
      )
}

export async function completeTask(taskReference: string): Promise<void> {
  const Octokit = await import('@octokit/rest')
  const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_TOKEN ||
      invariant(false, 'Required GITHUB_TOKEN variable.')}`,
  })
  const result = await octokit.issues.update({
    owner: CodeRepository.repoContext.repositoryOwner,
    repo: CodeRepository.repoContext.repositoryName,
    issue_number: +taskReference.substr(1),
    state: 'closed',
  })
  log.debug('Result:', result.data)
}
