# Hawtio tests

## Introduction

E2E UI tests

### Test tools and frameworks

- Selenium 4.x
- Selenide 6.x
- Cucumber 7.x

### Runtime Support

- Spring Boot 2.x
- Quarkus (in future)

### Test scenarios cover the following areas

- About modal window
- Authentication
- Camel
- Connect
- Help page
- JMX
- Logs
- Quartz
- Sample Plugin
- Runtime
- Spring Boot page


## Test Execution

### Sample Command

The command to run only Hawtio E2E UI tests from the `root` directory

```
mvn clean install -Dhawtio-e2e-tests -Druntime=springboot -Dtest=RunSpringBootAllTest
```

Also, the tests are triggered when building the whole Hawtio project.

Test reports can be found under `tests/spring-boot/target/surefire-reports/` directory.

### Command Options

- `-Druntime=` - defines a runtime in which tests are run.
  - `springboot`
  - `quarkus` - (not implemented yet)

- `-Dtest=` - defines the type of test set to be run.
  - `RunSpringBootAllTest`
  - `RunSpringBootSmokeTest`
  - more options can be found under `io/hawt/tests/spring/boot/runners`

#### Optional Selenide Options

- `-Dselenide.browser=` - defines a web browser to be used during test execution.
  - `chrome`
  - `firefox`
  - By default, Selenide picks up a web driver based on system default web browser.

- `-Dselenide.timeout=` - defines a timeout for loading a web page (in milliseconds).
  - `10000`
  - `20000`
  - etc
- `-Dselenide.headless=` - enables the ability to run the browser in headless mode.
  - `true`
  - `false`

More options can be found on Selenide [Configuration docs page](https://selenide.org/javadoc/current/com/codeborne/selenide/Configuration.html).
