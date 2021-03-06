const glob = require('glob')
const fs = require('fs')
const path = require('path')
const mkdirSync = require('./utils/mkdirSync')

const baseJs = require('./lib/swan/baseJs')
const baseCss = require('./lib/swan/baseCss')
const baseSwan = require('./lib/swan/baseSwan')

const SWAN = function() {}

SWAN.prototype = {
  run(source, dest) {
    // match base js
    glob(source + '/**/*.js', {
     // ignore: source + '/pages/**/*.js'
    }, (err, files) => {
      if (err) {
        console.warn(err, '')
        return false
      }
      files.forEach((file) => {
        const content = fs.readFileSync(file, {encoding: 'utf8'})
        const code = baseJs(content)
        const outPath = file.replace(source, dest)
        mkdirSync(outPath)
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
        let outPath = file.replace(source, dest)
        mkdirSync(outPath)
        outPath = outPath.replace(path.extname(outPath), '.wxss')
        fs.writeFileSync(outPath, code, {encoding: 'utf8'})
      })
    })

    // copy json | images
    glob(`${source}/**/*.@(png|jpg|jpeg|json)`, (err, files) => {
      if (err) {
        return false
      }
      files.forEach((file) => {
        const outPath = file.replace(source, dest)
        mkdirSync(outPath)
        fs.copyFileSync(file, outPath)
      })
    })

    // match pages/swan
    glob(`${source}/**/*.swan`, (err, files) => {
      if (err) {
        return false
      }
      files.forEach((file) => {
        const content = fs.readFileSync(file, {encoding: 'utf8'})
        const code = baseSwan(content)
        let outPath = file.replace(source, dest)
        mkdirSync(outPath)
        outPath = outPath.replace(path.extname(outPath), '.wxml')
        fs.writeFileSync(outPath, code, {encoding: 'utf8'})
      })
    })

  }
}

module.exports = SWAN
