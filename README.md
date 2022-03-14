# tap-reporter

Format a TAP stream using a different set of reporters, mainly [Mocha](https://mochajs.org/#reporters)'s.

The main reporter outside the mocha reporters is `sonarqube`. This reporter generates a [Generic Execution Data](https://docs.sonarqube.org/latest/analysis/generic-test/), complatible with SonarQube.

## Disclaimer

This package is a fork of [tap-mocha-reporter](github.axa.com/tapjs/tap-mocha-reporter). We decide to fork and publish this package because it seems all the open Pull Requests does not have activity in the last years. In any case, we acknowledgement the great job of the contributors of [tap-mocha-reporter](github.axa.com/tapjs/tap-mocha-reporter) <3.

## Getting started

Install the package using npm:

```console
npm i tap-reporter
```

## Usage

You need to specify a reporter with the first argument.

```bash
tap test/*.js | tap-reporter <reporter> [--options]
```

Programmatically, you can use this as a transform stream.

```javascript
var TSR = require('tap-reporter');

fs.createReadStream('saved-test-output.tap').pipe(TSR('sonarqube'));
```

### Options

#### --output (-o)

It generates a file with the output report.

```console
tap test/\*.js | tap-reporter sonarqube --output tests-execution.xml
```

The reporters type that support this option are: sonarqube, xunit, json, doc, markdown.

#### --prependTestFileName (-p)

This option is only available for the `sonarqube` report type. This adds a string to the front of the generated file name in the report useful if you run tests from within a subdirectory.

```console
tap test/\*.js | tap-reporter sonarqube --output tests-execution.xml --prependTestFileName "src/app/tests"
```
