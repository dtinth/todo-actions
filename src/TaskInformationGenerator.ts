import { ITodo, ITaskState } from './types'
import { createHash } from 'crypto'
import { repoContext } from './CodeRepository'

type TaskInformation = {
  state: ITaskState
  title: string
  body: string
}

export function generateTaskInformationFromTodo(todo: ITodo): TaskInformation {
  const title = todo.title

  const file = todo.file.fileName
  // TODO [#31]: Also link to end line in addition to just the starting line.
  // This requires changing `IFile` interface and `File` class to also keep track of where the TODO comment ends.
  const line = todo.startLine
  const owner = repoContext.repositoryOwner
  const repo = repoContext.repositoryName
  const defaultBranch = repoContext.defaultBranch

  const url = `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${file}#L${line}`
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
