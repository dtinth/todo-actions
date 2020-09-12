import { invariant, logger } from 'tkt'
import { Octokit } from '@octokit/rest'
import { graphql } from '@octokit/graphql'

import * as CodeRepository from './CodeRepository'

const log = logger('TaskManagementSystem')

type TaskInformation = {
  title: string
  body: string
}

export async function createTask(
  information: TaskInformation,
): Promise<string> {
  const { createIssue } = await graphql(
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
        title: information.title,
        body: information.body,
      },
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN || invariant(false, 'Required GITHUB_TOKEN variable.')}`,
      },
    },
  )
  log.debug('Create issue result:', createIssue)
  return createIssue.issue.number
    ? `#${createIssue.issue.number}`
    : invariant(
        false,
        'Failed to get issue number out of createIssue API call.',
      )
}

export async function completeTask(taskReference: string): Promise<void> {
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
  log.debug('Issue close result:', result.data)
}

export async function updateTask(
  taskReference: string,
  information: TaskInformation,
): Promise<void> {
  const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_TOKEN ||
      invariant(false, 'Required GITHUB_TOKEN variable.')}`,
  })
  const result = await octokit.issues.update({
    owner: CodeRepository.repoContext.repositoryOwner,
    repo: CodeRepository.repoContext.repositoryName,
    issue_number: +taskReference.substr(1),
    title: information.title,
    body: information.body,
  })
  log.debug('Issue update result:', result.data)
}
