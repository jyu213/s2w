const {parse, parseExpression} = require('@babel/parser')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('babel-types')

const SWAN = 'swan'
const WX = 'wx'

const run = function(content) {
  let sourceAst = parse(content, {sourceType: 'module'})

  traverse(sourceAst, {
    enter(path) {
      if (path.node.type === 'Identifier' && path.node.name === SWAN) {
        path.node.name = WX
      }

      // this.getData('xx') => this.data.xx,
      // @TODO: global getData function
      if (path.node.type === 'CallExpression' && path.node.callee.type === 'MemberExpression' &&
        path.node.callee.property.type === 'Identifier' && path.node.callee.property.name === 'getData') {
          const value = path.node.arguments[0].value
          const newNode = t.memberExpression(t.memberExpression(t.thisExpression(), t.identifier('data')), t.identifier(value))
          path.replaceWith(newNode)
      }
    },
    CallExpression: {
      enter(path) {
        if (path.node.callee.status) {
          return false
        }
        // this.setData(a, 1) => this.setData({a: 1})
        if (t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'setData' && !t.isObjectExpression(path.node.arguments[0])) {
            const prop = t.objectProperty(t.stringLiteral(path.node.arguments[0].value), path.node.arguments[1])
            const props = t.objectExpression([prop])
            path.node.callee.status = true
            path.replaceWith(t.callExpression(path.node.callee, [props]))
        }
      }
    }
  })
  const { code } = generate(sourceAst)

  return code
}

module.exports = run