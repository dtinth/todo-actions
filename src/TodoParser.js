/**
 * @typedef {object} ITodo
 */

/**
 * @param {import('./File').IFile} file
 * @returns {ITodo[]}
 */
exports.parseTodos = function(file) {
  /** @type {ITodo[]} */
  const out = []
  for (const line of file.lines) {
    const match = line.match(/^(\W+\s)TODO(?: \[([^\]\s]+)\])?:/)
    if (match) {
      out.push({})
    }
  }
  return out
}
