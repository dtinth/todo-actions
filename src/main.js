const { File } = require('./File')
const { parseTodos } = require('./TodoParser')
const { logger } = require('./Logging')

const log = logger('main')

require('yargs')
  .command('$0', 'Collect TODOs and create issues', {}, async args => {
    log.info('Search for files with TODO tags...')
    const filesWithTodoMarker = require('child_process')
      .execSync('git grep -Il TODO:', { encoding: 'utf8' })
      .split('\n')
      .filter(name => name)

    const todoComments = []
    const files = []

    log.info('Parsing TODO tags...')
    for (const filePath of filesWithTodoMarker) {
      // TODO: Implement ignoring paths
      if (filePath === 'README.md') continue

      const file = new File(filePath)
      const todos = parseTodos(file)
      log.info('%s: %s found', filePath, todos.length)
      todoComments.push(...todos)
      files.push(file)
    }

    log.info('Total TODOs found: %s', todoComments.length)

    const todosWithoutReference = todoComments.filter(todo => !todo.reference)
    log.info('TODOs without references: %s', todosWithoutReference.length)
    if (todosWithoutReference.length > 0) {
      for (const todo of todosWithoutReference) {
        todo.reference = `$${require('bson-objectid').default.generate()}`
      }
      const changedFiles = files.filter(file => file.contents.changed)
      log.info('Files changed: %s', changedFiles.length)
      for (const file of changedFiles) file.save()
    }
  })
  .strict()
  .demandCommand()
  .help()
  .parse()
