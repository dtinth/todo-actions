import { IFile, ITodo } from './types'

export function parseTodos(file: IFile): ITodo[] {
  const out: Todo[] = []

  let currentTodo: Todo | undefined
  for (const [lineIndex, line] of file.contents.lines.entries()) {
    const match = line.match(/^(\W+\s)TODO(?: \[([^\]\s]+)\])?:(.*)/)
    if (match) {
      const todo = new Todo(file, lineIndex, match[1], match[2], match[3])
      currentTodo = todo
      out.push(todo)
    } else if (currentTodo) {
      const beforePrefix = line.substr(0, currentTodo.prefix.length)
      const afterPrefix = line.substr(currentTodo.prefix.length)
      if (
        beforePrefix.trimRight() === currentTodo.prefix.trimRight() &&
        (!afterPrefix || beforePrefix.match(/\s$/))
      ) {
        currentTodo.handleLine(afterPrefix)
      } else {
        currentTodo = undefined
      }
    }
  }
  return out
}

class Todo implements ITodo {
  prefix: string
  line: number
  suffix: string
  body: string
  title: string

  private currentReference: string | null

  constructor(
    public file: IFile,
    line: number,
    prefix: string,
    reference: string | null,
    suffix: string,
  ) {
    this.line = line
    this.prefix = prefix
    this.currentReference = reference
    this.suffix = suffix
    this.title = suffix.trim()
    this.body = ''
  }

  get reference(): string | null {
    return this.currentReference
  }
  set reference(newRef) {
    this.currentReference = newRef
    this.file.contents.changeLine(
      this.line,
      `${this.prefix}TODO${newRef ? ` [${newRef}]` : ''}:${this.suffix}`,
    )
  }

  get startLine(): number {
    return this.line + 1
  }

  handleLine(line: string) {
    if (!this.title) {
      this.title = line
    } else if (this.body || line) {
      this.body += (this.body ? '\n' : '') + line
    }
  }
}
