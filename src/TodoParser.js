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
  for (const line of file.contents.lines) {
    const match = line.match(/^(\W+\s)TODO(?: \[([^\]\s]+)\])?:(?:\s(.*))?/)
    if (match) {
      out.push({
        file,
        // TODO:
        // Parse title that sits on the next line.
        title: match[3] || '',
        reference: match[2] || null,
      })
    }
  }
  return out
}
