console.log('Files in repo')
console.log(
  require('child_process')
    .execSync('git ls-files', { encoding: 'utf8' })
    .split('\n'),
)
