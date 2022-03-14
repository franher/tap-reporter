# tap-reporter

## 1.0.1

### Patch Changes

- a10cfb5: fix typo on the test case xml tag. It must be `testCase` instead of `testcase`.

## 1.0.0

### Major Changes

- 4762393: ## feat: add sonarqube report type

  This reporter type generates a [Generic Execution Data](https://docs.sonarqube.org/latest/analysis/generic-test/), complatible with SonarQube.

  ```console
  tap test/\*.js | tap-reporter sonarqube --output tests-execution.xml
  ```

  Note that this package is a fork of [tap-mocha-reporter](github.axa.com/tapjs/tap-mocha-reporter). We decide to fork and publish this package because it seems all the open Pull Requests does not have activity in the last years. In any case, we acknowledgement the great job of the contributors of [tap-mocha-reporter](github.axa.com/tapjs/tap-mocha-reporter) <3.

  A part of the addition of the sonarqube report type, this release has a refactor on code style on the files we have modified to add the feature. It uses `airbnb` styleguide with ESLint and Prettier.
