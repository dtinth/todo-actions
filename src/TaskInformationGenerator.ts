import { ITodo, ITaskState } from './types'
import { createHash } from 'crypto'

type TaskInformation = {
  state: ITaskState
  title: string
  body: string
}

export function generateTaskInformationFromTodo(todo: ITodo): TaskInformation {
  const title = todo.title

  // TODO [$5d2e030a8c6b330007e46c46]: Add link to source file in body.
  const body = todo.body

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
