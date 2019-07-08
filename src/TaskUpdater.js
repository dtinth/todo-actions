const invariant = require('invariant')

/**
 * @param {ITodo[]} todos
 */
exports.updateTasks = async function updateTasks(todos) {
  for (const todo of todos) {
    const reference =
      todo.reference ||
      invariant(false, 'Unexpected TODO without reference encountered')
    const unresolved = reference.startsWith('$')
    if (unresolved) {
      const todoUniqueKey = reference.substr(1)
      // TODO: Acquire a lock for TODO’s key.
      // TODO: Create an issue.
      // TODO: Associate the issue reference (resolution) to the TODO’s unique key.
      // TODO: Update the TODO reference to the resolved key.
    } else {
      // TODO: Generate the issue text.
      // TODO: Update the issue if changed.
    }
  }

  // TODO: Create a commit if some todos have been resolved to issue.
}
