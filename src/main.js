console.log('Files in repo')
console.log(
  require('child_process')
    .execSync('git grep -Il TODO:', { encoding: 'utf8' })
    .split('\n')
    .filter(name => name),
)
