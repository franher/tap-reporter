/**
 * Module dependencies.
 */

 var Base = require('./base')
 , utils = require('../utils')
 , fs = require('fs')
 , escape = utils.escape;

/**
* Save timer references to avoid Sinon interfering (see GH-237).
*/

var Date = global.Date
 , setTimeout = global.setTimeout
 , setInterval = global.setInterval
 , clearTimeout = global.clearTimeout
 , clearInterval = global.clearInterval;

/**
* Expose `GenericExecution`.
*/

exports = module.exports = GenericExecution;

/**
* Initialize a new `GenericExecution` reporter.
*
* @param {Runner} runner
* @param {} options
* @param {string} [options.output] File output
* @param {string} [options.prependTestFileName] TBD
* @api public
*/

function GenericExecution(runner, options) {
 Base.call(this, runner);
 var stats = this.stats
   , tests = []
   , self = this;

 if (options.reporterOptions && options.reporterOptions.output) {
     if (! fs.createWriteStream) {
         throw new Error('file output not supported in browser');
     }
     self.fileStream = fs.createWriteStream(options.reporterOptions.output);
 }

 runner.on('pending', function(test){
   tests.push(test);
 });

 runner.on('pass', function(test){
   tests.push(test);
 });

 runner.on('fail', function(test){
   tests.push(test);
 });

 runner.on('end', function(){
   self.write(tag('testExecutions', {
    version: '1',
   }, false));

   tests.forEach(function(t) { self.test(t); });
   self.write('</testExecutions>');
 });
}

/**
* Override done to close the stream (if it's a file).
*/
GenericExecution.prototype.done = function(failures, fn) {
   if (this.fileStream) {
       this.fileStream.end(function() {
           fn(failures);
       });
   } else {
       fn(failures);
   }
};

/**
* Inherit from `Base.prototype`.
*/

Object.setPrototypeOf(GenericExecution.prototype, Base.prototype);

/**
* Write out the given line
*/
GenericExecution.prototype.write = function(line) {
   if (this.fileStream) {
       this.fileStream.write(line + '\n');
   } else {
       console.log(line);
   }
};

/**
* Output tag for the given `test.`
*/

GenericExecution.prototype.test = function(test, ostream) {
 var attrs = {
     name: test.parent.fullTitle()
   , time: (test.duration / 1000) || 0
 };

 if ('failed' == test.state) {
   var err = test.err;
   this.write(tag('testcase', attrs, false, tag('failure', {message:test.title}, false, cdata(escape(err.message) + "\n" + err.stack))));
 } else if (test.pending) {
   this.write(tag('testcase', attrs, false, tag('skipped', {message:test.title}, false, cdata(escape(err.message) + "\n" + err.stack))));
 } else {
   this.write(tag('testcase', attrs, true) );
 }
};

/**
* HTML tag helper.
*/

function tag(name, attrs, close, content) {
 var end = close ? '/>' : '>'
   , pairs = []
   , tag;

 for (var key in attrs) {
   pairs.push(key + '="' + escape(attrs[key]) + '"');
 }

 tag = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end;
 if (content) tag += content + '</' + name + end;
 return tag;
}

/**
* Return cdata escaped CDATA `str`.
*/

function cdata(str) {
 return '<![CDATA[' + escape(str) + ']]>';
}
