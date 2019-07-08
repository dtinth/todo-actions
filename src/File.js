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
    this.contents = new FileContents(
      require('fs').readFileSync(fileName, 'utf8'),
    )
  }

  save() {
    if (this.contents.changed) {
      require('fs').writeFileSync(
        this.fileName,
        this.contents.toString(),
        'utf8',
      )
    }
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
    this.contents = new FileContents(contents)
  }

  save() {}
}

class FileContents {
  /**
   * @param {string} contents
   */
  constructor(contents) {
    ensureFileContentsInterface(this)

    /**
     * @private
     */
    this._lines = contents.split('\n')

    this.changed = false
  }

  get lines() {
    return /** @type {ReadonlyArray<string>} */ (this._lines)
  }

  /**
   * @param {number} lineIndex
   * @param {string} newLineContents
   */
  changeLine(lineIndex, newLineContents) {
    this._lines[lineIndex] = newLineContents
    this.changed = true
  }

  toString() {
    return this._lines.join('\n')
  }
}

exports.FileContents = FileContents

/**
 * For type checking.
 * @param {IFile} file
 */
function ensureFileInterface(file) {}

/**
 * For type checking.
 * @param {IFileContents} contents
 */
function ensureFileContentsInterface(contents) {}
