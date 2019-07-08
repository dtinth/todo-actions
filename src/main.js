const { File } = require('./File')
const { parseTodos } = require('./TodoParser')
const { logger } = require('./Logging')
const childProcess = require('child_process')
const invariant = require('invariant')

const log = logger('main')

require('yargs')
  .command('$0', 'Collect TODOs and create issues', {}, async args => {
    log.info('Search for files with TODO tags...')
    const filesWithTodoMarker = childProcess
      .execSync('git grep -Il TODO:', { encoding: 'utf8' })
      .split('\n')
      .filter(name => name)

    const todoComments = []
    const files = []

    log.info('Parsing TODO tags...')
    for (const filePath of filesWithTodoMarker) {
      // TODO [$5d21c7a2b86bd10007ba06aa]: Implement ignoring paths
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

    // TODO: Stop if not default branch.

    if (todosWithoutReference.length > 0) {
      for (const todo of todosWithoutReference) {
        todo.reference = `$${require('bson-objectid').default.generate()}`
      }
      const changedFiles = files.filter(file => file.contents.changed)
      log.info('Files changed: %s', changedFiles.length)
      for (const file of changedFiles) {
        file.save()
      }
      childProcess.execFileSync('git', [
        'add',
        ...changedFiles.map(file => file.fileName),
      ])
      childProcess.execFileSync(
        'git',
        ['commit', '-m', 'Collect TODO comments'],
        { stdio: 'inherit' },
      )
      if (!process.env.GITHUB_TOKEN) {
        throw `Maybe you forgot to enable the GITHUB_TOKEN secret?`
      }
      childProcess.execSync(
        'git push origin $(git rev-parse --abbrev-ref HEAD)',
        { stdio: 'inherit' },
      )
    }

    // Every TODO must have a reference by now.
    for (const todo of todoComments) {
      invariant(
        todo.reference,
        'TODO "%s" at %s must have a reference by now!',
        todo.title,
        todo.file.fileName,
      )
    }

    process.exit(0)
  })
  .strict()
  .demandCommand()
  .help()
  .parse()
