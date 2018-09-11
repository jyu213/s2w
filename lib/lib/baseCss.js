const { parse } = require('postcss');

// const {parse, parseExpression} = require('@babel/parser')
// const generate = require('@babel/generator').default
// const traverse = require('@babel/traverse').default

const SWAN = 'swan'
const WX = 'wx'

const run = function(content) {
  let root = parse(content)
  root.walkRules('*', (rule) => {
    // @TODO: swan element
    rule.selector = 'html, body'
  })

  return root.toString()
}

module.exports = run