![hawtio][logo]

[![Test](https://github.com/hawtio/hawtio/actions/workflows/test.yml/badge.svg)](https://github.com/hawtio/hawtio/actions/workflows/test.yml)

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

The command must be run from `tests` directory.

```
mvn clean install -Druntime=springboot -Dtest=RunSpringBootAllTest
```

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

## Contributing

We love [contributions](http://hawt.io/docs/contributing/)!  Here are the resources on how to get you involved in Hawtio development.

* [FAQ](http://hawt.io/docs/faq/)
* [Change Log](CHANGES.md)
* [How to contribute](http://hawt.io/docs/contributing/)
* [Community](http://hawt.io/community/)

Check out the [GitHub issues](https://github.com/hawtio/hawtio/issues) for finding issues to work on.

## License

Hawtio is licensed under [Apache License, Version 2.0](LICENSE.txt).

[logo]: http://hawt.io/images/hawtio_logo.svg "hawtio"
