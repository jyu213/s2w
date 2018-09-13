const { parse } = require('postcss')

let bodyFontSize = 16
const run = function(content) {
  let root = parse(content)
  root.walkRules('*', (rule) => {
    // @TODO: swan element
    rule.selector = 'page'
  })
  root.walkRules(/(^|[\s,])(body|html)([\s,]|$)/, (rule) => {
    rule.selector = 'page'

    rule.parent.name !== 'media' && rule.nodes.forEach((decl) => {
      if (decl.prop === 'font-size') {
        bodyFontSize = decl.value.match(/\d+/)[0]
      }
    })
  })
  root.walkDecls((decl) => {
    // switch rm to accuracy value
    const REM_REG = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)rem/g;
    if (decl.value.indexOf('rem') > -1) {
      decl.value = decl.value.replace(REM_REG, (m, $1, $2) => {
        if (!$1) {
          return m
        }
        return ($1 * (bodyFontSize / 16)).toFixed(2) + 'rem'
      })
    }
  })

  return root.toString()
}

module.exports = run