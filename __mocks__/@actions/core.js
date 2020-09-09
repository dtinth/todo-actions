const fs = require('fs')
const yaml = require('js-yaml')

const content = fs.readFileSync(`${__dirname}/../../action.yml`, 'utf-8')
const config = yaml.safeLoad(content)

module.exports = {
  getInput (name) {
    return (config.inputs[name] || {}).default || ''
  }
}

