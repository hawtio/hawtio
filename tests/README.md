# Hawtio tests

## Introduction

### Test tools and frameworks

- Selenium 4.x - a tool/library that implements [WebDriver W3C Recommendation](https://www.w3.org/TR/webdriver1/)
- Selenide 6.x - a framework based on Selenium WebDriver adding more functionality and features
- Cucumber 7.x - Behavior Driven Development tool for expressing test scenarios in plain English, nicely integrating with Selenium/Selenide

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

All test scenarios can be found under `${hawtio.src.root}/tests/hawtio-test-suite/src/test/resources/io/hawt/tests/features`

## Test Execution

All commands are to be run from the root directory of the Hawtio project.

First of all, it's needed to build the project (just to get the artifacts in local Maven repository without running the tests):

```console
mvn clean install -DskipTests -Pe2e
```

`-Pe2e` enables the build of test-related modules.

## The testing elements (detailed)

There are 3 components involved when running Hawtio integration (e2e) tests:
- The test scenarios - placed in `tests/hawtio-test-suite` Maven module of https://github.com/hawtio/hawtio repository
  - Scenarios are implemented using Cucumber and Selenium
  - Can be run directly with `mvn verify -Pe2e`
  - Can be run using `quay.io/hawtio/hawtio-test-suite` container image
- Hawtio web/client application
  - Runs in a browser (or using https://www.w3.org/TR/webdriver/ with Selenium/Selenide)
  - Can be served by `yarn webpack server` express.js server or from Java Hawtio application deployed as WAR application, Spring Boot application or Quarkus application
- JVM where sample Camel route is running
  - Can run Hawtio server application itself or only a Jolokia Agent connected to from Hawtio web application using "Connect tab"

However the tests are so flexible that we may have different modes of running the tests.

We may want to run _full Hawtio_ or run Hawtio client that connects to remote Jolokia agent:
- Hawtio web application and the JVM with camel route may run in the same JVM - The Jolokia agent and Hawtio client
  application are served from the same web server. `-Dio.hawt.test.app.connect.url` property can't be specified
- Hawtio web application is running separately and `-Dio.hawt.test.app.connect.url` property points at remote Jolokia agent
  to be used for remote connection. This mode allows testing https://github.com/hawtio/hawtio-next client project.

### Choosing how the Hawtio application being tested is deployed

See `io.hawt.tests.features.config.TestConfiguration.getAppDeploymentMethod` class for the details.

The cucumber/selenium tests need the managed/automated/webdriver browser to be pointed to a URL from which Hawtio
web application (`index.html` and related JS/CSS files) will be loaded.
This web application may already be served from a JVM where Jolokia is running, or this "first Hawtio" may contain
only single "Connect" tab which will be used to yet another JVM with Jolokia and Camel routes running.

The deployment method is selected in this order, depending on available system properties:
- when `-Dio.hawt.test.url` is specified, Cucumber/Selenium tests connect to already running application
- when `-Dio.hawt.test.docker.image` is specified, [Testcontainers](https://testcontainers.com/) framework is used
  - ports 8080 (Quarkus) and 10000-10001 (Spring Boot) are exposed
  - it may be one of:
    - `quay.io/hawtio/hawtio-quarkus-test-app:5.x-17`
    - `quay.io/hawtio/hawtio-quarkus-test-app:5.x-21`
    - `quay.io/hawtio/hawtio-springboot-test-app:5.x-17`
    - `quay.io/hawtio/hawtio-springboot-test-app:5.x-21`
- when tests also run in container (`-Dhawtio-container` is specified) the two above options are all we can use
- when `-Dio.hawt.test.use.openshift=true` is specified, Hawtio Operator is used to deploy Hawtio application in available cluster
- when `-Dio.hawt.test.app.path` is specified, we can point to Maven module (its `target/` directory after the application is built),
  so the test starts the application itself
- when `-Dio.hawt.test.runtime` is specified, we can choose from one of the Maven modules designed for running the test:
  - `-Dio.hawt.test.runtime=springboot` - `io.hawt.tests:hawtio-tests-springboot` Maven application
  - `-Dio.hawt.test.runtime=quarkus` - `io.hawt.tests:hawtio-tests-quarkus` Maven application
- finally, when `org.jetbrains.run.directory` system property is set (which is true when running or debugging an application from IntelliJ IDEA),
  Cucumber tests automatically detect if there's SpringBoot or Quarkus Hawtio application running and `URLDeployment` is automatically created
  - we can use Cucumber for Java plugin for IDEA to run `*.feature` test directly from IDE

### Letting the test start the application or pointing the tests to existing application

We may let the test start Hawtio application or point the test to an existing (already running) application. This is a requirement from `io.hawt.tests.features.hooks.DeployAppHook.appSetup()` Cucumber hook:
- Using `-Pe2e-springboot` or `-Pe2e-quarkus` Maven profiles we prepare some system properties that tell Cucumber tests
  to use `MavenDeployment` and starts Quarkus or SpringBoot application using Java ProcessBuilder
  - `local-app` is set to true to enable `local-test-app-dependency` Maven profile
  - `test-runtime` (set into `io.hawt.test.runtime`) property adds `io.hawt.tests:hawtio-tests-${test-runtime}` dependency to Maven classpath
  - `hawtio.url.suffix` property is chosen for given runtime (`/hawtio` for Quarkus, `/actuator/hawtio` for Spring Boot) and set as
    `io.hawt.test.url.suffix` property
  - port is chosen depending on the runtime (`management.server.port` or `server.port` properties for Spring Boot, `quarkus.http.port` for Quarkus)
- without specifying `-Pe2e-<runtime>` we have to run the application for Selenium tests to connect to (whether or not we will use additional remote Jolokia agent as Hawtio remote connection)
  - we have to specify `-Dio.hawt.test.url` property to choose `URLDeployment` instead of `MavenDeployment`. This should point to running Hawtio client application.
    - It can be an application running from `yarn start` for example, but then we also have to specify `-Dio.hawt.test.app.connect.url` because application started with `webpack server` doesn't have the JVM backend with running Camel route to test.
    - It can be an application started from `tests/springboot` or `tests/quarkus` - this will result in similar tests as the ones run with `-Pe2e-springboot` or `-Pe2e-quarkus`
  - provide `-Dio.hawt.test.runtime` property to select appropriate tests
  - alternatively we can start `*.feature` directly from IntelliJ IDEA and `io.hawt.test.url` + `io.hawt.test.runtime` properties will
    be detected automatically

We can run the application being tested using containers (with `docker` or preferably `podman`):
- `-Dio.hawt.test.docker.image` property should point to one of available quay.io images, for example `quay.io/hawtio/hawtio-springboot-test-app:5.x-17`
- `-Dio.hawt.test.runtime` and `-Dhawtio.url.suffix` properties should be detected based on the image name

When using `podman` and do not have `docker` command available, we have to tell Testcontainers how to use it (because `docker` is expected):

    export DOCKER_HOST=unix:///run/user/${UID}/podman/podman.sock
    systemctl --user enable --now podman.socket

## Running the tests using `mvn` from command line

Here is general information:
* When entire Hawtio was already build with `-Pe2e` specified, we no longer have to provide this profile when running the tests if we simply specify `-f tests/hawtio-test-suite`. When using `-pl :hawtio-test-suite -am` option, `-Pe2e` is mandatory
* `-Pe2e-springboot` and `-Pe2e-quarkus` profiles set up proper dependencies and system properties, so Cucumber test can start the application for us
* When planning to use already running application, we have to specify `-Dio.hawt.test.url` and optionally `-Dio.hawt.test.app.connect.url`
  properties (it's required when `-Dio.hawt.test.url` points to application run with `webpack` for example, because such application doesn't have background Java server with Jolokia and/or Camel application running. It's pure JS express.js application).
* When using existing application, we also have to specify `-Dio.hawt.test.runtime` to disable tests specific to given runtime (see Cucumber annotations/tags)

If we want to run selected Cucumber tests (features) we have to use one trick - add some annotation like `@this` on selected scenario, for example:
```
@this
Scenario: Check that JMX tree is collapsing correctly
  Given User is on "JMX" page
  When User collapses JMX tree
  Then All JMX tree nodes are "hidden"
```

And use this annotation as JUnit 5 _group_:
```console
mvn install -f tests/hawtio-test-suite -Dio.hawt.test.url=http://localhost:8080/hawtio -Pio.hawt.test.runtime=quarkus -Dtest=CucumberTest -Dgroups=this
```

It's much easier to run individual test with Cucumber for Java plugin for IntelliJ IDEA.

### Spring Boot E2E tests

Note that "Spring Boot" means Hawtio deployment method, where we have:
 - JVM started with `main()` class annotated with `@org.springframework.boot.autoconfigure.SpringBootApplication` or with `mvn spring-boot:run`
 - reachable port 10001 (the management port, `management.server.port` option)
 - Hawtio accessible at `/actuator/hawtio`
 - Jolokia accessible at `/actuator/jolokia`

**Spring Boot with the application started by the test itself**
```console
mvn verify -f tests/hawtio-test-suite -Pe2e-springboot 
```

In this setup the URLs are auto-detected and/or specified in Maven configuration for `e2e-springboot` profile. This
profile sets these properties:
 - `test-runtime=springboot` - to parameterize the dependency from a profile activated by setting `local-app=true`
 - `local-app=true` - activates `local-test-app-dependency` profile which adds `io.hawt.tests:hawtio-tests-${test-runtime}` artifact to the classpath so the test can run the application itself
 - `hawtio.url.suffix=/actuator/hawtio` - configures the URL used in `com.codeborne.selenide.Selenide.open(java.lang.String)` call

Because `io.hawt.test.url` is NOT set, `TestConfiguration` uses `io.hawt.tests.features.setup.deployment.MavenDeployment` which
starts JVM process using `java -jar` with a JAR found in `../${test-runtime}/target/*.jar`. Current directory is the location of `hawtio-test-suite` module.

**Spring Boot with the application started by us and used as Hawtio application** (full Spring Boot application with Camel routes running)
```console
mvn spring-boot:run -f tests/springboot
mvn verify -f tests/hawtio-test-suite -Dio.hawt.test.url=http://localhost:10001/actuator/hawtio
```

In this setup we have to point Cucumber/Selenium tests to a running application. We don't have to tell the test suite
that `io.hawt.test.url` points to a Spring Boot application - it's not relevant (so we don't need `-Pe2e-springboot` profile or `test-runtime=springboot` property or `-Dio.hawt.test.runtime` property).
Instead of running the application with `spring-boot:run`, we can start it from the IDE.

**Spring Boot with the application started by us and used as remote Jolokia agent** (using `webpack server`)
```console
DISABLE_WS=true yarn webpack server
mvn spring-boot:run -f tests/springboot
mvn verify -f tests/hawtio-test-suite -Dio.hawt.test.url=http://localhost:3000/hawtio -Dio.hawt.test.app.connect.url=http://localhost:10001/actuator/jolokia -Dhawtio-next-ci=true
```

In this setup, we first start a `webpack server` in a JS project - this may be both https://github.com/hawtio/hawtio/tree/5.x/console and
https://github.com/hawtio/hawtio-next/tree/main/app!
We also manually (could be in IDE) start a Spring Boot application.
Finally we have to point Cucumber/Selenium tests to a running application (which has only the "Connect" tab available) and to pass
the URL (using `-Dio.hawt.test.app.connect.url`) to use at "Connect" tab to connect to actual Spring Boot application.

Even if the Spring Boot application itself runs Hawtio, we use Hawtio as served by `webpack server`. That's why
`-Dhawtio-next-ci=true` option is needed to skip `plugin.feature` scenario.

**Spring Boot with the application started in a container**
```console
export DOCKER_HOST=unix:///run/user/${UID}/podman/podman.sock
systemctl --user enable --now podman.socket
podman run -ti --rm -p 10001:10001 quay.io/hawtio/hawtio-springboot-test-app:5.x-17
mvn verify -f tests/hawtio-test-suite -Dio.hawt.test.url=http://localhost:10001/actuator/hawtio
```

This setup start Spring Boot Hawtio application using a container image and tests are pointed to http://localhost:10001/actuator/hawtio. There's no
remote Jolokia connection using "Connect" tab in Hawtio.

**Spring Boot with the application started in a container and used as remote Jolokia agent**
```console
DISABLE_WS=true yarn webpack server
export DOCKER_HOST=unix:///run/user/${UID}/podman/podman.sock
systemctl --user enable --now podman.socket
podman run -ti --rm -p 10001:10001 quay.io/hawtio/hawtio-springboot-test-app:5.x-17
mvn verify -f tests/hawtio-test-suite -Dio.hawt.test.url=http://localhost:3000/hawtio -Dio.hawt.test.app.connect.url=http://localhost:10001/actuator/jolokia -Dhawtio-next-ci=true
```

Finally, for completeness, here:
 - Spring Boot application with Hawtio is running from a container (but Hawtio is not used, only Jolokia agent)
 - Hawtio web application is served from `webpack server`
 - tests are running by pointing to http://localhost:3000/hawtio web application and http://localhost:10001/actuator/jolokia remote Jolokia agent to be accessed using "Connect" tab.

**Spring Boot with the tests run from a container**
```console
mvn spring-boot:run -f tests/springboot
cd /tmp
podman run --rm -ti --network host --shm-size="2g" quay.io/hawtio/hawtio-test-suite:5.x-17 -Dselenide.browser=firefox -Dio.hawt.test.url=http://localhost:10001/actuator/hawtio
```

Here we used simplest method to run Spring Boot Hawtio application without remote Jolokia Agent to be connected to. Any previously mentioned
method can also be used.
The difference is that this time we run the test suite itself using a container.

### Quarkus E2E tests

Note that "Quarkus" means Hawtio deployment method, where we have:
- JVM started with `java -jar target/quarkus-app/quarkus-run.jar` or `mvn compile quarkus:dev`
- reachable port 8080
- Hawtio accessible at `/hawtio`
- Jolokia accessible at `/hawtio/jolokia`

**Quarkus with the application started by the test itself**
```console
mvn verify -f tests/hawtio-test-suite -Pe2e-quarkus 
```

In this setup the URLs are auto-detected and/or specified in Maven configuration for `e2e-quarkus` profile. This
profile sets these properties:
- `test-runtime=quarkus` - to parameterize the dependency from a profile activated by setting `local-app=true`
- `local-app=true` - activates `local-test-app-dependency` profile which adds `io.hawt.tests:hawtio-tests-${test-runtime}` artifact to the classpath so the test can run the application itself
- `hawtio.url.suffix=/hawtio` - configures the URL used in `com.codeborne.selenide.Selenide.open(java.lang.String)` call

Because `io.hawt.test.url` is NOT set, `TestConfiguration` uses `io.hawt.tests.features.setup.deployment.MavenDeployment` which
starts JVM process using `java -jar` with a JAR found in `../${test-runtime}/target/*.jar`. Current directory is the location of `hawtio-test-suite` module.

**Quarkus with the application started by us and used as Hawtio application** (full Quarkus application with Camel routes running)
```console
java -jar tests/quarkus/target/quarkus-app/quarkus-run.jar
mvn verify -f tests/hawtio-test-suite -Dio.hawt.test.url=http://localhost:8080/hawtio -Dio.hawt.test.runtime=quarkus
```

In this setup we have to point Cucumber/Selenium tests to a running application.
We don't need `-Pe2e-quarkus` profile, but we need `-Dio.hawt.test.runtime=quarkus` property to activate Cucumber `@quarkus` annotation, so Quarkus-specific scenarios are run (like starting Camel debugging).

**Quarkus with the application started by us and used as remote Jolokia agent** (using `webpack server`)
```console
DISABLE_WS=true yarn webpack server
java -jar tests/quarkus/target/quarkus-app/quarkus-run.jar
mvn verify -f tests/hawtio-test-suite -Dio.hawt.test.url=http://localhost:3000/hawtio -Dio.hawt.test.app.connect.url=http://localhost:8080/hawtio/jolokia -Dio.hawt.test.runtime=quarkus -Dhawtio-next-ci=true
```

In this setup, we first start a `webpack server` in a JS project - this may be both https://github.com/hawtio/hawtio/tree/5.x/console and
https://github.com/hawtio/hawtio-next/tree/main/app!
We also manually (could be in IDE) start a Quarkus application.
Finally we have to point Cucumber/Selenium tests to a running application (which has only the "Connect" tab available) and to pass
the URL (using `-Dio.hawt.test.app.connect.url`) to use at "Connect" tab to connect to actual Quarkus application.

Even if the Quarkus application itself runs Hawtio, we use Hawtio as served by `webpack server`. That's why
`-Dhawtio-next-ci=true` option is needed to skip `plugin.feature` scenario.
We don't need `-Pe2e-quarkus` profile, but we need `-Dio.hawt.test.runtime=quarkus` property to activate Cucumber `@quarkus` annotation, so Quarkus-specific scenarios are run (like starting Camel debugging).

**Quarkus with the application started in a container**
```console
export DOCKER_HOST=unix:///run/user/${UID}/podman/podman.sock
systemctl --user enable --now podman.socket
podman run -ti --rm -p 8080:8080 quay.io/hawtio/hawtio-quarkus-test-app:5.x-17
mvn verify -f tests/hawtio-test-suite -Dio.hawt.test.url=http://localhost:8080/hawtio -Dio.hawt.test.runtime=quarkus
```

This setup start Quarkus Hawtio application using a container image and tests are pointed to http://localhost:8080/hawtio. There's no
remote Jolokia connection using "Connect" tab in Hawtio.

**Quarkus with the application started in a container and used as remote Jolokia agent**
```console
DISABLE_WS=true yarn webpack server
export DOCKER_HOST=unix:///run/user/${UID}/podman/podman.sock
systemctl --user enable --now podman.socket
podman run -ti --rm -p 8080:8080 quay.io/hawtio/hawtio-quarkus-test-app:5.x-17
mvn verify -f tests/hawtio-test-suite -Dio.hawt.test.url=http://localhost:3000/hawtio -Dio.hawt.test.app.connect.url=http://localhost:8080/hawtio/jolokia -Dio.hawt.test.runtime=quarkus -Dhawtio-next-ci=true
```

Finally, for completeness, here:
- Quarkus application with Hawtio is running from a container (but Hawtio is not used, only Jolokia agent)
- Hawtio web application is served from `webpack server`
- tests are running by pointing to http://localhost:3000/hawtio web application and http://localhost:8080/hawtio/jolokia remote Jolokia agent to be accessed using "Connect" tab.

**Quarkus with the tests run from a container**
```console
java -jar tests/quarkus/target/quarkus-app/quarkus-run.jar
cd /tmp
podman run --rm -ti --network host --shm-size="2g" quay.io/hawtio/hawtio-test-suite:5.x-17 -Dselenide.browser=firefox -Dio.hawt.test.url=http://localhost:8080/hawtio -Dio.hawt.test.runtime=quarkus
```

Here we used simplest method to run Quarkus Hawtio application without remote Jolokia Agent to be connected to. Any previously mentioned
method can also be used.
The difference is that this time we run the test suite itself using a container.

### Camel CLI tests

**Spring Boot**

```console
mvn install -Pe2e,e2e-springboot -am -pl :hawtio-test-suite -Dlocal-app=true \
  -Dio.hawt.test.url=http://localhost:8888/hawtio \
  -Dio.hawt.test.app.connect.url=http://localhost:10001/actuator/hawtio/jolokia \
  -Dhawtio-next-ci
```

**Quarkus**

```console
mvn install -Pe2e,e2e-quarkus -am -pl :hawtio-test-suite -Dlocal-app=true \
  -Dio.hawt.test.url=http://localhost:8888/hawtio \
  -Dio.hawt.test.app.connect.url=http://localhost:8080/hawtio/jolokia \
  -Dhawtio-next-ci
```

### Camel K E2E tests

You need to provide an OpenShift environment, either you need to be logged in to a cluster already or supply proper arguments you can find in the `io.hawt.tests.features.config.TestConfiguration` class.
```console
mvn install -Pe2e,e2e-camelk -am -pl :hawtio-test-suite -Dio.hawt.test.use.openshift=true
```

### Additional Command Options

- `-Dtest=` - defines the type of test set to be run.
  - `CucumberTest` executes the Cucumber teststsuite
  - `<class name>` executes any other JUnit test

### Containerization

Build e2e containers with the following command: `mvn install -DskipTests -Pe2e -Pdocker-testsuite -Ptests-docker -Dhawtio-container -Ddocker.buildArg.JAVA_VERSION=<<JAVA_VERSION>> -pl :hawtio-test-suite,:hawtio-tests-quarkus,:hawtio-tests-springboot -am`

- -Ptests-docker - builds both quarkus and springboot application used for testing
- -Pdocker-testsuite - builds the testsuite as well

Resulting images are named hawtio-test-suite:<JAVA_VERSION>, hawtio-<quarkus|springboot>-app:<JAVA_VERSION>

Default JAVA_VERSION is 17.

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
