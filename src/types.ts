/**
 * A representation of a file being processed,
 * with mutable contents.
 */
export interface IFile {
  fileName: string
  contents: IFileContents
  /**
   * Saves the file back into the file system.
   */
  save(): void
}

export interface IFileContents {
  changed: boolean

  /**
   * File contents as array of lines.
   * The newline character has been stripped.
   * May be mutated to change the contents of the file.
   */
  lines: ReadonlyArray<string>

  /**
   * Change a line
   */
  changeLine(lineIndex: number, newLineContents: string): void
}

export interface ITodo {
  file: IFile
  reference: string | null
  title: string
  body: string
}

export interface ITaskState {
  hash: string
}
