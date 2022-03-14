/**
 * Module dependencies.
 */
 var path = require('path')
 var Base = require('./base')
 , utils = require('../utils')
 , fs = require('fs')
 , escape = utils.escape

/**
* Expose `Sonarqube`.
*/

exports = module.exports = Sonarqube

/**
* Initialize a new `Sonarqube` reporter.
*
* @param {Runner} runner
* @param {} options
* @param {string} [options.output] File output
* @param {string} [options.prependTestFileName] Prepend a path to file names
* @api public
*/

function Sonarqube(runner, options) {
 Base.call(this, runner)
 var stats = this.stats
   , files = []
   , index = 0
   , self = this

 if (options.reporterOptions && options.reporterOptions.output) {
     if (! fs.createWriteStream) {
         throw new Error('file output not supported in browser')
     }
     self.fileStream = fs.createWriteStream(options.reporterOptions.output)
 }

 runner.on('pending', function(test){
  files[index].tests.push(test)
 })

 runner.on('pass', function(test){
  files[index].tests.push(test)
 })

 runner.on('fail', function(test){
   files[index].tests.push(test)
 })

 runner.on('suite', function(suite){
  if (!suite.root) return
  files.push({
    path: suite.title,
    tests: []
  })
})

runner.on('suite end', function(suite){
  if (!suite.root) return
  index++
})

 runner.on('end', function(){
   self.write(tag('testExecutions', {
    version: '1',
   }, false))
  files.forEach(function(file) { 
    self.write(tag('file', {
      path: options.reporterOptions.prependTestFileName ? path.join(options.reporterOptions.prependTestFileName, file.path) : file.path,
     }, false))
     file.tests.forEach(function(t) { 
      self.test(t)
     })
     self.write('</file>')
  })
   self.write('</testExecutions>')
 })
}

/**
* Override done to close the stream (if it's a file).
*/
Sonarqube.prototype.done = function(failures, fn) {
   if (this.fileStream) {
       this.fileStream.end(function() {
           fn(failures)
       })
   } else {
       fn(failures)
   }
}

/**
* Inherit from `Base.prototype`.
*/

Object.setPrototypeOf(Sonarqube.prototype, Base.prototype)

/**
* Write out the given line
*/
Sonarqube.prototype.write = function(line) {
   if (this.fileStream) {
       this.fileStream.write(line + '\n')
   } else {
       console.log(line)
   }
}

/**
* Output tag for the given `test.`
*/

Sonarqube.prototype.test = function(test, ostream) {
 var attrs = {
     name: test.parent.fullTitle()
   , time: (test.duration / 1000) || 0
 }

 if ('failed' == test.state) {
   var err = test.err
   this.write(tag('testcase', attrs, false, tag('failure', {message:test.title}, false, cdata(escape(err.message) + "\n" + err.stack))))
 } else if (test.pending) {
   this.write(tag('testcase', attrs, false, tag('skipped', {message:test.title}, false, cdata(escape(err.message) + "\n" + err.stack))))
 } else {
   this.write(tag('testcase', attrs, true) )
 }
}

/**
* HTML tag helper.
*/

function tag(name, attrs, close, content) {
 var end = close ? '/>' : '>'
   , pairs = []
   , tag

 for (var key in attrs) {
   pairs.push(key + '="' + escape(attrs[key]) + '"')
 }

 tag = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end
 if (content) tag += content + '</' + name + end
 return tag
}

/**
* Return cdata escaped CDATA `str`.
*/

function cdata(str) {
 return '<![CDATA[' + escape(str) + ']]>'
}
