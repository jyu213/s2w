const htmlparser = require("htmlparser2")
const ElementType = require('../../utils/domelementtype')
const singleTag = require('../../utils/singleTag')
let DomHandler = require('../../utils/domHandler')


const run = function (content) {
  let body
  DomHandler.prototype._addContentElement = function(properties) {
    const { attribs, type, name, data } = properties

    if (type === ElementType.Tag) {
      // @TODO: stuff diff
      let attributes = ''
      Object.keys(attribs).map((key) => {
        // 接口不一致
        if (key === 's-for') {
          if (attribs[key].match('in')) {
            const arr = attribs[key].split(' ')
            const item = arr[0].split(',')[0] || 'item'
            const index = arr[0].split(',')[1] || 'index'
            const value = arr[arr.length - 1]
            if (item) {
              attributes += `wx:for-item="${item}" `
            }
            if (index) {
              attributes += `wx:for-index="${index}" `
            }
            attributes += `${key.replace('s-', 'wx:')}="{{${value}}}" `
          } else {
            attributes += `${key.replace('s-', 'wx:')}="${attribs[key]}" `
          }
        } else if (key === 's-if') {
          let value = attribs[key]
          if (!value.match(/^\{\{(.*)\}\}$/g)) {
            value = `{{${value}}}`
          }
          attributes += `${key.replace('s-', 'wx:')}="${value}"`
        // } else if (key === 'style') {
        //   // replace rem @TODO
        //   let value = attribs[key]
        } else if (key.match(/^s-/g)) {
          // key = key.replace('s-', 'wx:')
          attributes += `${key.replace('s-', 'wx:')}="${attribs[key]}" `
        } else {
          if (attribs[key] === '') {
            attributes += `${key} `
          } else {
            attributes += `${key}="${attribs[key]}" `
          }
        }
      })

      if (singleTag.indexOf(name) === -1) {
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
