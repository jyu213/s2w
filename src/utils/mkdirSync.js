const fs = require('fs')
const mkdirp = require('mkdirp')

/**
 * create dir
 * @param {String} path
 */
const mkdirSync = function(path) {
  let dirArr = path.split('/')
  dirArr.pop()
  const dir = dirArr.join('/')
  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir)
  }
}

module.exports = mkdirSync
