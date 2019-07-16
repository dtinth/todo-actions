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
        // TODO: Properly generate the initial issue body.
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
