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
  // TODO [#31]: Link to end line
  const line = todo.startLine
  const owner = repoContext.repositoryOwner
  const repo = repoContext.repositoryName

  // TODO [#33]: Don’t hardcode master branch when generating URL
  const url = `https://github.com/${owner}/${repo}/blob/master/${file}#L${line}`
  const link = `[${file}:${line}](${url})`
  const body = [
    todo.body,
    '',
    '---',
    `_` +
      `This issue has been automatically created by [todo-actions](https://github.com/apps/todo-actions) based on a TODO comment found in ${link}. ` +
      // TODO [#34]: Don’t hardcode master branch in task description
      `It will automatically be closed when the TODO comment is removed from the master branch.` +
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
