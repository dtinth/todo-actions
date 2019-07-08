/**
 * @typedef {object} ITodo
 * @prop {import('./File').IFile} file
 * @prop {string | null} reference
 * @prop {string} title
 */

/**
 * @param {import('./File').IFile} file
 * @returns {ITodo[]}
 */
exports.parseTodos = function(file) {
  /** @type {Todo[]} */
  const out = []

  /** @type {Todo | undefined} */
  let currentTodo
  for (const [lineIndex, line] of file.contents.lines.entries()) {
    const match = line.match(/^(\W+\s)TODO(?: \[([^\]\s]+)\])?:(.*)/)
    if (match) {
      const todo = new Todo(file, lineIndex, match[1], match[2], match[3])
      currentTodo = todo
      out.push(todo)
    } else if (currentTodo) {
    }
  }
  return out
}

class Todo {
  /**
   * @param {import('./File').IFile} file
   * @param {number} line
   * @param {string} prefix
   * @param {string | null} reference
   * @param {string} suffix
   */
  constructor(file, line, prefix, reference, suffix) {
    ensureTodoInterface(this)
    this.file = file
    this.line = line
    this.prefix = prefix
    this.currentReference = reference
    this.suffix = suffix
    this.title = suffix.trim()
  }

  /** @returns {string | null} */
  get reference() {
    return this.currentReference
  }
  set reference(newRef) {
    this.currentReference = newRef
    this.file.contents.changeLine(
      this.line,
      `${this.prefix}TODO${newRef ? ` [${newRef}]` : ''}:${this.suffix}`,
    )
  }
}

/**
 * For type checking.
 * @param {ITodo} todo
 */
function ensureTodoInterface(todo) {}
