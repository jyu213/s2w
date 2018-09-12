const ElementType = require("domelementtype");
const NodePrototype = require('./node')
const ElementPrototype = require('./element')
const singleTag = require('./singleTag')
var re_whitespace = /\s+/g;
var defaultOpts = {
	normalizeWhitespace: false, //Replace all whitespace with single spaces
	withStartIndices: false, //Add startIndex properties to nodes
	withEndIndices: false, //Add endIndex properties to nodes
};
const DEBUG = 0
var log = function () {
  if (DEBUG) {
    return console.log.apply(console, arguments);
  }
};

function DomHandler(callback, options, elementCB) {
  this._callback = callback
  this._options = options || defaultOpts
  this._elementCB = elementCB
  this.dom = []
  this.content = ''
  this._done = false
  this._tagStack = []
  this._parser = this._parser || null
}
DomHandler.prototype = {
  onreset() {
    log('reset')
    DomHandler.call(this, this._callback, this._options, this._elementCB)
  },
  onend() {
    log('end')
    if (this._done) return
    this._done = true
    this._parser = null
    this._handleCallback(null)
  },
  onerror(error) {
    log('onerror')
    if (typeof this._callback === 'function') {
      this._callback(error, this.dom, this.content)
    } else {
      if (error) throw error
    }
  },
  onclosetag(tagname) {
    log('closetag', tagname)
    var elem = this._tagStack.pop();

    if (singleTag.indexOf(tagname) === -1) {
      this.content += `</${tagname}>`
    }

    if(this._options.withEndIndices && elem){
      elem.endIndex = this._parser.endIndex;
    }

    if(this._elementCB) this._elementCB(elem);
  },
  onopentag(name, attribs) {
    log('opentag', name, attribs)
    var properties = {
      type: ElementType.Tag,
      name: name,
      attribs: attribs,
      children: []
    };

    var element = this._createDomElement(properties);

    this._addDomElement(element);
    this._tagStack.push(element);
    this._addContentElement(properties)
  },
  ontext(data) {
    log('text', data)
    var normalize = this._options.normalizeWhitespace || this._options.ignoreWhitespace;

    var lastTag;

    if(!this._tagStack.length && this.dom.length && (lastTag = this.dom[this.dom.length-1]).type === ElementType.Text){
      if(normalize){
        lastTag.data = (lastTag.data + data).replace(re_whitespace, " ");
      } else {
        lastTag.data += data;
      }
    } else {
      if(
        this._tagStack.length &&
        (lastTag = this._tagStack[this._tagStack.length - 1]) &&
        (lastTag = lastTag.children[lastTag.children.length - 1]) &&
        lastTag.type === ElementType.Text
      ){
        if(normalize){
          lastTag.data = (lastTag.data + data).replace(re_whitespace, " ");
        } else {
          lastTag.data += data;
        }
      } else {
        if(normalize){
          data = data.replace(re_whitespace, " ");
        }

        var element = this._createDomElement({
          data: data,
          type: ElementType.Text
        });

        this._addDomElement(element);
      }
    }

    // add content
    let text
    if (normalize) {
      text = data.replace(re_whitespace, ' ')
    } else {
      text = data
    }
    const properties = {
      type: ElementType.Text,
      data: text
    }
    this._addContentElement(properties)
  },
  oncomment(data) {
    log('comments', data)
    var lastTag = this._tagStack[this._tagStack.length - 1];

    if(lastTag && lastTag.type === ElementType.Comment){
      lastTag.data += data;
      return;
    }

    var properties = {
      data: data,
      type: ElementType.Comment
    };

    var element = this._createDomElement(properties);

    this._addDomElement(element);
    this._tagStack.push(element);

    this._addContentElement(properties)
  },
  oncdatastart() {
    log('datastart')
    var properties = {
      children: [{
        data: "",
        type: ElementType.Text
      }],
      type: ElementType.CDATA
    };

    var element = this._createDomElement(properties);

    this._addDomElement(element);
    this._tagStack.push(element);
  },
  oncdataend() {
    log('dataend')
    this._tagStack.pop();
  },
  oncommentend() {
    log('commented')
    this._tagStack.pop();
  },
  onprocessinginstruction(name, data) {
    log('processing')
    var element = this._createDomElement({
      name: name,
      data: data,
      type: ElementType.Directive
    });

    this._addDomElement(element);
  },

  _createDomElement(properties) {
    var element;
    if (properties.type === "tag") {
      element = Object.create(ElementPrototype);
    } else {
      element = Object.create(NodePrototype);
    }

    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        element[key] = properties[key];
      }
    }
    return element;
  },
  _addDomElement(element) {
    var parent = this._tagStack[this._tagStack.length - 1];
    var siblings = parent ? parent.children : this.dom;
    var previousSibling = siblings[siblings.length - 1];

    element.next = null;

    if(this._options.withStartIndices){
      element.startIndex = this._parser.startIndex;
    }
    if(this._options.withEndIndices){
      element.endIndex = this._parser.endIndex;
    }

    if(previousSibling){
      element.prev = previousSibling;
      previousSibling.next = element;
    } else {
      element.prev = null;
    }

    siblings.push(element);
    element.parent = parent || null;
  },
  _addContentElement(properties) {
    const { attribs, type, name, data } = properties
    log(properties, 'properties')

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
        } else if (key.match(/^s-/g)) {
          // key = key.replace('s-', 'wx:')
          attributes += `${key.replace('s-', 'wx:')}="${attribs[key]}" `
        } else {
          attributes += `${key}="${attribs[key]}" `
        }
      })

      if (singleTag.indexOf(name) === -1) {
        this.content += `<${name} ${attributes}>`
      } else {
        this.content += `<${name} ${attributes}/>`
      }
    } else if (type === ElementType.Comment) {
      this.content += `<!-- ${data} -->`
    } else if (type === ElementType.Text) {
      this.content += data
    }
  }
}
DomHandler.prototype._handleCallback = DomHandler.prototype.onerror

module.exports = DomHandler
