# Hawtio tests

## Introduction

E2E UI tests

### Test tools and frameworks

- Selenium 4.x
- Selenide 6.x
- Cucumber 7.x

### Runtime Support

- Spring Boot 2.x
- Quarkus 2.x

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

All test scenarios can be found under `tests/features/src/main/resources/io/hawt/tests/features`


## Test Execution

All commands to be run from the root directory of the Hawtio project.

First of all, it's needed to build the project.

```
mvn install -DskipTests
```

### Spring Boot 2.x E2E tests

```
mvn install -Pe2e-springboot -am -pl tests/springboot
```

### Quarkus 2.x E2E tests
```
mvn install -Pe2e-quarkus -am -pl tests/quarkus
```

### Additional Command Options

- `-Dtest=` - defines the type of test set to be run.
  - Spring Boot 2.x
    - `SpringBootAllTest`
    - `SpringBootSmokeTest`
  - Quarkus 2.x
    - `QuarkusAllTest`
    - `QuarkusSmokeTest`

### Optional Selenide Options

- `-Dselenide.browser=` - defines a web browser to be used during test execution.
  - `chrome`
  - `firefox`
  - By default, Selenide picks up a web driver based on a system default web browser.

- `-Dselenide.timeout=` - defines a timeout for loading a web page (in milliseconds).
  - `10000`
  - `20000`
  - etc
- `-Dselenide.headless=` - enables the ability to run the browser in headless mode (`true` by default).
  - `true`
  - `false`

More options can be found on Selenide [Configuration docs page](https://selenide.org/javadoc/current/com/codeborne/selenide/Configuration.html).
