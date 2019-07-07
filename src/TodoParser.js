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
  /** @type {ITodo[]} */
  const out = []
  for (const [lineIndex, line] of file.contents.lines.entries()) {
    const match = line.match(/^(\W+\s)TODO(?: \[([^\]\s]+)\])?:(.*)/)
    if (match) {
      const prefix = match[1]
      const suffix = match[3]
      const startIndex = lineIndex
      let _reference = match[2] || null

      /** @type {ITodo} */
      const todo = {
        file,
        // TODO:
        // Parse title that sits on the next line.
        title: (match[3] || '').trim(),
        get reference() {
          return _reference
        },
        set reference(newRef) {
          _reference = newRef
          file.contents.changeLine(
            startIndex,
            `${prefix}TODO${newRef ? ` [${newRef}]` : ''}:${suffix}`,
          )
        },
      }
      out.push(todo)
    }
  }
  return out
}
