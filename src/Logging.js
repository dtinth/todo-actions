var bole = require('bole')
var pretty = require('bistre')()

bole.output({
  level: 'debug',
  stream: pretty,
})

pretty.pipe(process.stdout)

/**
 * @typedef {(...args: any[]) => void} LogFn
 */

/**
 * @typedef {object} ILogger
 * @prop {LogFn} debug
 * @prop {LogFn} info
 * @prop {LogFn} warn
 * @prop {LogFn} error
 */

/**
 * @param {string} moduleName
 * @returns {ILogger}
 */
exports.logger = moduleName => bole(moduleName)
