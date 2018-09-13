const { parse } = require('postcss')

const run = function(content) {
  let root = parse(content)

  root.walkAtRules('import', (rule) => {
    if (rule.params.indexOf('.wxss')) {
      rule.params = rule.params.replace('.wxss', '.css')
    }
  })
  return root.toString()
}

module.exports = run