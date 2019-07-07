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
  })
})
