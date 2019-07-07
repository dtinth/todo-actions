const { parseTodos } = require('./TodoParser')

describe('parseTodos', () => {
  it('is a function', () => {
    expect(parseTodos).toBeInstanceOf(Function)
  })
})
