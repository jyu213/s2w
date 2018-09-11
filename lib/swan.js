const glob = require('glob')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp');

const baseJs = require('./lib/baseJs')
const baseCss = require('./lib/baseCss')
const baseSwan = require('./lib/baseSwan')

const checkDir = function(file, source, dest) {
  const outPath = file.replace(source, dest)
  let dirArr = outPath.split('/')
  dirArr.pop()
  const dir = dirArr.join('/')
  if (!fs.existsSync(dir)) {
    mkdirp(dir)
  }
  return outPath
}

const SWAN = function() {
}

SWAN.prototype = {
  run(source, dest) {
    // match base js
    glob(source + '/**/*.js', {
     // ignore: source + '/pages/**/*.js'
    }, (err, files) => {
      if (err) {
        console.log(err, '')
        return false
      }
      files.forEach((file) => {
        console.log(file, 'get file')
        const content = fs.readFileSync(file, {encoding: 'utf8'})
        const code = baseJs(content)
        const outPath = file.replace(source, dest)
        console.log(outPath, 'out')
        let dirArr = outPath.split('/')
        dirArr.pop()
        const dir = dirArr.join('/')
        if (!fs.existsSync(dir)) {
          mkdirp.sync(dir)
        }
        fs.writeFileSync(outPath, code, {encoding: 'utf8'})
      })
    })

    // match all css
    glob(`${source}/**/*.css`, {
     //   ignore: `${source}/pages/**`
    }, (err, files) => {
      if (err) {
        return false
      }
      files.forEach((file) => {
        const content = fs.readFileSync(file, {encoding: 'utf8'})
        const code = baseCss(content)
          let outPath = checkDir(file, source, dest)
          outPath = outPath.replace(path.extname(outPath), '.wxss')
        fs.writeFileSync(outPath, code, {encoding: 'utf8'})
      })
    })

    // copy json | images,   @TODO

    // match pages/js
    // glob(`${source}/pages/**/*.js`, (err, files) => {
    //   if (err) {
    //     return false
    //   }
    //   files.forEach((file) => {

    //   })
    // })

    // match pages/swan
    glob(`${source}/pages/**/*.swan`, (err, files) => {
      if (err) {
        return false
      }
      files.forEach((file) => {
        const content = fs.readFileSync(file, {encoding: 'utf8'})
        const code = baseSwan(content)
        let outPath = checkDir(file, source, dest)
        outPath = outPath.replace(path.extname(outPath), '.wxml')
        console.log(code, 'code', outPath)
        fs.writeFileSync(outPath, code, {encoding: 'utf8'})
      })
    })

  }
}

module.exports = SWAN
