const glob = require('glob')
const fs = require('fs')
const path = require('path')
const mkdirSync = require('./utils/mkdirSync')

const baseJs = require('./lib/mp/baseJs')
const baseCss = require('./lib/mp/baseCss')
const baseMp = require('./lib/mp/baseMp')

const MP = function() {}

MP.prototype = {
  run(source, dest) {
    // match base js
    glob(`${source}/**/*.js`, {
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

    // match all wxss
    glob(`${source}/**/*.wxss`, {
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
        outPath = outPath.replace(path.extname(outPath), '.css')
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

    // match pages/MP
    glob(`${source}/**/*.wxml`, (err, files) => {
      if (err) {
        return false
      }
      console.log('files', files)
      files.forEach((file) => {
        const content = fs.readFileSync(file, {encoding: 'utf8'})
        const code = baseMp(content)
        let outPath = file.replace(source, dest)
        mkdirSync(outPath)
        outPath = outPath.replace(path.extname(outPath), '.swan')
        console.log(outPath,'outPath')
        fs.writeFileSync(outPath, code, {encoding: 'utf8'})
      })
    })
  }
}

module.exports = MP
