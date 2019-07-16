import { IFile, IFileContents } from './types'

export class File implements IFile {
  fileName: string
  contents: FileContents

  constructor(fileName: string) {
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
export class MockFile implements IFile {
  fileName: string
  contents: FileContents

  constructor(fileName: string, contents: string) {
    this.fileName = fileName
    this.contents = new FileContents(contents)
  }

  save() {}
}

export class FileContents implements IFileContents {
  lines: string[]
  changed: boolean

  constructor(contents: string) {
    this.lines = contents.split('\n')
    this.changed = false
  }

  changeLine(lineIndex: number, newLineContents: string) {
    this.lines[lineIndex] = newLineContents
    this.changed = true
  }

  toString() {
    return this.lines.join('\n')
  }
}
