const htmlparser = require("htmlparser2")
const ElementType = require('../../utils/domelementtype')
const singleTag = require('../../utils/singleTag')
let DomHandler = require('../../utils/domHandler')


const run = function (content) {
  let body
  DomHandler.prototype._addContentElement = function(properties) {
    const { attribs, type, name, data } = properties

    console.log(properties, 'properties')

    if (type === ElementType.Tag) {
      // @TODO: stuff diff
      let attributes = ''
      Object.keys(attribs).map((key) => {
        // 接口不一致
        if (name === 'template' && key === 'data') {
          // @TODO
          attribs[key] = `{${attribs[key]}}`
        }
        if (key.match(/^wx:for-items/g)) {
          attributes += `${key.replace('wx:for-items', 's-for')}="${attribs[key]}" `
        } else if (key.match(/^wx:/g)) {
          // key = key.replace('s-', 'wx:')
          attributes += `${key.replace('wx:', 's-')}="${attribs[key]}" `
        } else {
          attribs[key] = attribs[key].replace('.wxml', '.swan')
          if (attribs[key] === '') {
            attributes += `${key} `
          } else {
            attributes += `${key}="${attribs[key]}" `
          }
        }
      })

      if (singleTag.indexOf(name) === -1 && !(name === 'template' && !!attribs.is)) {
        this.content += `<${name} ${attributes}>`
      } else {
        this.content += `<${name} ${attributes}/>`
      }
    } else if (type === ElementType.TagClose) {
      if (singleTag.indexOf(name) === -1) {
        this.content += `</${name}>`
      }
    } else if (type === ElementType.Comment) {
      this.content += `<!-- ${data} -->`
    } else if (type === ElementType.Text) {
      this.content += data
    }
  }

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
