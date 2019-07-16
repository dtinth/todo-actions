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
  // TODO [$5d2e06495bcba90007c1ffc7]: Link to end line
  const line = todo.startLine
  // TODO [$5d2e06495bcba90007c1ffc8]: Don’t hardcode master branch when generating URL
  const url = `https://github.com/${repoContext.repositoryOwner}/${
    repoContext.repositoryName
  }/blob/master/${file}#L${line}`
  const link = `[${file}:${line}](${url})`
  const body = [
    todo.body,
    '',
    '---',
    `_This issue has been automatically created by [todo-actions](https://github.com/apps/todo-actions) based on a TODO comment found in ${link}_`,
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
