const { parseTodos } = require('./TodoParser')
const { MockFile } = require('./File')

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
    expect(result[0].title).toBe('Item 1')
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
})
