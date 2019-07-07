/**
 * @typedef {object} ITodo
 * @prop {string | null} reference
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
      out.push({
        reference: match[2] || null,
      })
    }
  }
  return out
}
