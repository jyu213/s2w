const { parse } = require('@babel/parser')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('babel-types')

const SWAN = 'swan'
const WX = 'wx'

const run = function(content) {
  let sourceAst = parse(content, {sourceType: 'module'})

  traverse(sourceAst, {
    enter(path) {
      if (path.node.type === 'Identifier' && path.node.name === WX) {
        path.node.name = SWAN
      }
    },
    CallExpression: {
      enter(path) {

      }
    }
  })
  const { code } = generate(sourceAst)

  return code
}

module.exports = run