const { File } = require('./File')
const { parseTodos } = require('./TodoParser')
const filesWithTodoMarker = require('child_process')
  .execSync('git grep -Il TODO:', { encoding: 'utf8' })
  .split('\n')
  .filter(name => name)

const todoComments = []

console.log('Parsing TODO tags:')
for (const filePath of filesWithTodoMarker) {
  // TODO: Implement ignoring paths

  const file = new File(filePath)
  const todos = parseTodos(file)
  console.log('- %s: %s found', filePath, todos.length)
  todoComments.push(...todos)
}

console.log('Total: %s found', todoComments.length)
