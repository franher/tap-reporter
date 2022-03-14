/**
 * Module dependencies.
 */
const path = require('path');
const fs = require('fs');
const Base = require('./base');
const utils = require('../utils');

const { escape } = utils;

/**
 * HTML tag helper.
 */

function tag(name, attrs, close, content) {
  const end = close ? '/>' : '>';
  const pairs = [];

  Object.keys(attrs).forEach(key => pairs.push(`${key}="${escape(attrs[key])}"`));

  const attrsStr = pairs.length ? ` ${pairs.join(' ')}` : '';

  let xmlTag = `<${name}${attrsStr}${end}`;
  if (content) {
    xmlTag += `${content}</${name}${end}`;
  }

  return xmlTag;
}

/**
 * Return cdata escaped CDATA `str`.
 */

function cdata(str) {
  return `<![CDATA[${escape(str)}]]>`;
}

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
  Base.call(this, runner);
  const self = this;
  const files = [];
  let index = 0;

  if (options.reporterOptions && options.reporterOptions.output) {
    if (!fs.createWriteStream) {
      throw new Error('file output not supported in browser');
    }
    self.fileStream = fs.createWriteStream(options.reporterOptions.output);
  }

  runner.on('pending', test => {
    files[index].tests.push(test);
  });

  runner.on('pass', test => {
    files[index].tests.push(test);
  });

  runner.on('fail', test => {
    files[index].tests.push(test);
  });

  runner.on('suite', suite => {
    if (suite.root) {
      files.push({
        path: suite.title,
        tests: []
      });
    }
  });

  runner.on('suite end', suite => {
    if (suite.root) {
      index += 1;
    }
  });

  runner.on('end', () => {
    self.write(
      tag(
        'testExecutions',
        {
          version: '1'
        },
        false
      )
    );

    files.forEach(file => {
      self.write(
        tag(
          'file',
          {
            path: options.reporterOptions.prependTestFileName
              ? path.join(options.reporterOptions.prependTestFileName, file.path)
              : file.path
          },
          false
        )
      );

      file.tests.forEach(t => {
        self.test(t);
      });

      self.write('</file>');
    });

    self.write('</testExecutions>');
  });
}

/**
 * Override done to close the stream (if it's a file).
 */
Sonarqube.prototype.done = function done(failures, fn) {
  if (this.fileStream) {
    this.fileStream.end(() => fn(failures));
  } else {
    fn(failures);
  }
};

/**
 * Inherit from `Base.prototype`.
 */

Object.setPrototypeOf(Sonarqube.prototype, Base.prototype);

/**
 * Write out the given line
 */
Sonarqube.prototype.write = function write(line) {
  if (this.fileStream) {
    this.fileStream.write(`${line}\n`);
  } else {
    console.log(line);
  }
};

/**
 * Output tag for the given `test.`
 */

Sonarqube.prototype.test = function test(testObj) {
  const attrs = {
    name: testObj.parent.fullTitle(),
    time: testObj.duration / 1000 || 0
  };
  const { err } = testObj;

  if (testObj.state === 'failed') {
    this.write(
      tag(
        'testCase',
        attrs,
        false,
        tag(
          'failure',
          { message: test.title },
          false,
          cdata(`${escape(err.message)}\n${err.stack}`)
        )
      )
    );
  } else if (test.pending) {
    this.write(
      tag(
        'testCase',
        attrs,
        false,
        tag(
          'skipped',
          { message: test.title },
          false,
          cdata(`${escape(err.message)}\n${err.stack}`)
        )
      )
    );
  } else {
    this.write(tag('testCase', attrs, true));
  }
};

/**
 * Expose `Sonarqube`.
 */

module.exports = Sonarqube;
