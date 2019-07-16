import { File } from './File'
import { parseTodos } from './TodoParser'
import { logger, cli, invariant } from 'tkt'
import { execSync, execFileSync } from 'child_process'
import { updateTasks } from './TaskUpdater'

const log = logger('main')

cli()
  .command('$0', 'Collect TODOs and create issues', {}, async args => {
    log.info('Search for files with TODO tags...')
    const filesWithTodoMarker = execSync('git grep -Il TODO:', {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(name => name)

    const todoComments = []
    const files = []

    log.info('Parsing TODO tags...')
    for (const filePath of filesWithTodoMarker) {
      // TODO [#1]: Implement ignoring paths
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

    // TODO [#2]: Stop if not default branch.

    if (todosWithoutReference.length > 0) {
      for (const todo of todosWithoutReference) {
        todo.reference = `$${require('bson-objectid').default.generate()}`
      }
      saveChanges(files, 'Collect TODO comments')
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

    // Update all the tasks according to the TODO state.
    await updateTasks(todoComments)
    await saveChanges(files, 'Update TODO references')

    process.exit(0)
  })
  .parse()

function saveChanges(files: File[], commitMessage: string) {
  const changedFiles = files.filter(file => file.contents.changed)
  log.info('Files changed: %s', changedFiles.length)

  if (changedFiles.length === 0) {
    return
  }

  for (const file of changedFiles) {
    file.save()
  }
  execFileSync('git', ['add', ...changedFiles.map(file => file.fileName)])
  execFileSync('git', ['commit', '-m', commitMessage], {
    stdio: 'inherit',
  })
  if (!process.env.GITHUB_TOKEN) {
    throw `Maybe you forgot to enable the GITHUB_TOKEN secret?`
  }
  execSync('git push origin $(git rev-parse --abbrev-ref HEAD)', {
    stdio: 'inherit',
  })
}
