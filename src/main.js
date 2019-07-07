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

    log.info('Parsing TODO tags...')
    for (const filePath of filesWithTodoMarker) {
      // TODO: Implement ignoring paths
      if (filePath === 'README.md') continue

      const file = new File(filePath)
      const todos = parseTodos(file)
      log.info('%s: %s found', filePath, todos.length)
      todoComments.push(...todos)
    }

    log.info('Total: %s found', todoComments.length)
  })
  .strict()
  .demandCommand()
  .help()
  .parse()
