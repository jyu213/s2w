const htmlparser = require("htmlparser2")
const DomHandler = require('./domHandler')


const run = function (content) {
  let body
  const handle = new DomHandler((err, dom, str) => {
    if (err) {
      return false
    }
    body = str
  })

  const parser = new htmlparser.Parser(handle)

  parser.write(content)
  parser.end()
  return body
}

module.exports = run
