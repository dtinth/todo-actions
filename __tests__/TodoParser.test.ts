import { parseTodos } from '../src/TodoParser'
import { MockFile } from '../src/File'

const MARKER = 'TODO'

describe('parseTodos', () => {
  it('is a function', () => {
    expect(parseTodos).toBeInstanceOf(Function)
  })

  it('can parse todo', () => {
    const file = new MockFile(
      'main.js',
      `
        // ${MARKER}: Item 1

        // ${MARKER}: Item 2
        // Body

        // ${MARKER}: Item 3
        //
        // Extended body

        // Not part of TODO

        /*
         * ${MARKER}: Item 4
         * Body
         *
         * Extended body
         */

        <!--
          - ${MARKER}: Item 5
          - Body
          -
          - Extended body

          Not part of TODO
          -->
        
          # ${MARKER}: Item 6
          # Body
          #
          # Extended body
          #-
          # Not part of TODO
      `,
    )
    const result = parseTodos(file)
    expect(result).toHaveLength(6)
    expect(result[0].file).toBe(file)
    expect(result[0].title).toBe('Item 1')
    expect(result[1].title).toBe('Item 2')
    expect(result[2].title).toBe('Item 3')
    expect(result[3].title).toBe('Item 4')
    expect(result[4].title).toBe('Item 5')
    expect(result[5].title).toBe('Item 6')

    expect(result[0].body).toBe('')
    expect(result[1].body).toBe('Body')
    expect(result[2].body).toBe('Extended body')
    expect(result[3].body).toBe('Body\n\nExtended body')
    expect(result[4].body).toBe('Body\n\nExtended body')
    expect(result[5].body).toBe('Body\n\nExtended body')
  })

  it('detects marker with reference', () => {
    const file = new MockFile(
      'main.js',
      `
      // ${MARKER} [#1]: Item 1

      // ${MARKER} [$wow]: Item 2

      // ${MARKER} [todo-actions#1]: Item 3

      // ${MARKER} [https://github.com/dtinth/todo-actions/issues/1]: Item 4
      `,
    )
    const result = parseTodos(file)
    expect(result).toHaveLength(4)
    expect(result[0].reference).toBe('#1')
    expect(result[1].reference).toBe('$wow')
    expect(result[2].reference).toBe('todo-actions#1')
    expect(result[3].reference).toBe(
      'https://github.com/dtinth/todo-actions/issues/1',
    )
  })

  it('allows title on the next line', () => {
    const file = new MockFile(
      'main.js',
      `
        // ${MARKER}:
        // Title
        // Body
      `,
    )
    const result = parseTodos(file)
    expect(result).toHaveLength(1)
    expect(result[0].file).toBe(file)
    expect(result[0].title).toBe('Title')
    expect(result[0].body).toBe('Body')
  })
})
