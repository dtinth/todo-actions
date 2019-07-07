/**
 * @typedef {object} IFile
 * A representation of a file being processed,
 * with mutable contents.
 *
 * @prop {string} fileName
 *
 * @prop {string[]} lines
 *  File contents as array of lines.
 *  The newline character has been stripped.
 *  May be mutated to change the contents of the file.
 *
 * @prop {() => void} save
 *  Saves the file back into the file system.
 */

/**
 * A file from file system.
 */
exports.File = class File {
  /**
   * @param {string} fileName
   */
  constructor(fileName) {
    ensureFileInterface(this)

    this.fileName = fileName
    this.lines = require('fs')
      .readFileSync(fileName, 'utf8')
      .split('\n')
  }

  save() {
    require('fs').writeFileSync(this.fileName, this.lines.join('\n'), 'utf8')
  }
}

/**
 * A mock file.
 */
exports.MockFile = class MockFile {
  /**
   * @param {string} fileName
   * @param {string} contents
   */
  constructor(fileName, contents) {
    ensureFileInterface(this)

    this.fileName = fileName
    this.lines = contents.split('\n')
  }

  save() {}
}

/**
 * For type checking.
 * @param {IFile} file
 */
function ensureFileInterface(file) {}
