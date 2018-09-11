const {parse, parseExpression} = require('@babel/parser')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default

const SWAN = 'swan'
const WX = 'wx'

const run = function(content) {
  let sourceAst = parse(content, {sourceType: 'module'})

  traverse(sourceAst, {
    enter(path) {
      if (path.node.type === 'Identifier' && path.node.name === SWAN) {
        path.node.name = WX
      }
    }
  })
  const { code } = generate(sourceAst)

  return code
}

module.exports = run