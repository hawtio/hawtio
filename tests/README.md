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

```console
mvn install -DskipTests
```

### Spring Boot 2.x E2E tests

```console
mvn install -Pe2e,e2e-springboot -am -pl :hawtio-test-suite -Dlocal-app=true
```

### Quarkus 2.x E2E tests

```console
mvn install -Pe2e,e2e-quarkus -am -pl :hawtio-test-suite -Dlocal-app=true
```

### Additional Command Options

- `-Dtest=` - defines the type of test set to be run.
  - Spring Boot 2.x
    - `SpringBootAllTest`
    - `SpringBootSmokeTest`
  - Quarkus 2.x
    - `QuarkusAllTest`
    - `QuarkusSmokeTest`

#### Modes of execution

hawtio-test-suite can test application in 3 different ways:

- start its own java app (MavenDeployment), it is expected that the application is compiled and you specified the runtime.
  - related maven arguments are -Pe2e-<quarkus|springboot>, -Dlocal-app=true (to automatically compile the tested app)
- start a container with the tested app
  - related maven argument is `-Dio.hawt.test.docker.image=<<DOCKER_IMAGE>>`
- specify a URL to an already running application:
  - related maven argument is `-Dio.hawt.test.url=<<URL>>`
  - to use the connect plugin to connect to some other application you can use `-Dio.hawt.test.app.connect.url`

### Containerization

Build e2e containers with the following command: `mvn install -DskipTests -Pe2e -Pdocker-testsuite -Ptests-docker -Dhawtio-container -Ddocker.buildArg.JAVA_VERSION=<<JAVA_VERSION>> -pl :hawtio-test-suite,:hawtio-tests-quarkus,:hawtio-tests-springboot -am`

- -Ptests-docker - builds both quarkus and springboot application used for testing
- -Pdocker-testsuite - builds the testsuite as well

Resulting images are named hawtio-test-suite:<JAVA_VERSION>, hawtio-<quarkus|springboot>-app:<JAVA_VERSION>

Default JAVA_VERSION is 11.

#### Running the containerized testsuite

Following command can be used to run the docker testsuite with the tested app running in a container, forwarding VNC port and surefire debug port. Any arguments after the docker image are passed to the mvn verify command.

```console
docker run -it -p 5900:5900 -p 5005:5005 -v /tmp/target:/hawtio-test-suite/tests/hawtio-test-suite/target/ -v /tmp/target/build:/hawtio-test-suite/tests/hawtio-test-suite/build/ -v /var/run/docker.sock:/var/run/docker.sock --add-host=host.docker.internal:host-gateway hawtio-test-suite:11 -Pe2e-springboot -Dio.hawt.test.docker.image=hawtio-springboot-app:11 -Dselenide.browser=firefox
```

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
