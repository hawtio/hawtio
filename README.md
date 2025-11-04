![hawtio][logo]

[![Test](https://github.com/hawtio/hawtio/actions/workflows/test.yml/badge.svg?branch=4.x)](https://github.com/hawtio/hawtio/actions/workflows/test.yml)
[![E2E Test](https://github.com/hawtio/hawtio/actions/workflows/e2e_test.yml/badge.svg?branch=4.x)](https://github.com/hawtio/hawtio/actions/workflows/e2e_test.yml)

## Introduction

[Hawtio](https://hawt.io) is a lightweight and modular Web console for managing Java applications.

![Hawtio screenshot](./docs/hawtio-console.png)

Hawtio has [plugins](https://hawt.io/docs/plugins/) such as: Apache Camel and JMX (Logs, Spring Boot, Quartz, and more will be provided soon).
You can dynamically extend Hawtio with [your own plugins](https://github.com/hawtio/hawtio-sample-plugin-ts) or automatically discover plugins inside the JVM.

The only server side dependency (other than the static HTML/CSS/JS/images) is the excellent [Jolokia library](http://jolokia.org) which has small footprint (around 300KB) and is available as a [JVM agent](http://jolokia.org/agent/jvm.html), or comes embedded as a servlet inside the `hawtio-default.war`.

## Get Started

- [Running from CLI](#running-from-cli-jbang)
- [Running a Spring Boot app](#running-a-spring-boot-app)
- [Running a Quarkus app](#running-a-quarkus-app)
- [Deploying on OpenShift](https://github.com/hawtio/hawtio-online)

For more details and other containers, see [Get Started Guide](https://hawt.io/docs/get-started.html).

### Running from CLI (JBang)

If you haven't installed [JBang](https://www.jbang.dev/) yet, first install it: <https://www.jbang.dev/download/>

You can start up Hawtio on your machine using the following `jbang` command.

```console
jbang app install hawtio@hawtio/hawtio
hawtio --help
```

#### Connecting directly to a remote JVM from CLI

Starting from Hawtio 4.3.0, it is possible to connect to remote Java applications directly from the CLI ([#3731](https://github.com/hawtio/hawtio/issues/3731)).
Passing a remote Jolokia endpoint URL in the form `[Name]=[Jolokia URL]` to the `--connection` or `-n` option will automatically attempt to connect to that endpoint when Hawtio starts.

```console
hawtio --connection=myconn=http://localhost:8778/jolokia/
```

If you have previously connected to an endpoint URL with a name, the connection information is cached in the browser's local storage via the Connect plugin. In that case, you can connect to that endpoint by simply specifying the same connection name without URL.

```console
hawtio --connection=myconn
```

You can also connect to multiple JVMs at once by providing the `--connection` options multiple times.

```console
hawtio --connection=conn1 --connection=conn2 --connection=conn3
```

In this case, multiple tabs open simultaneously on the browser, each showing the Hawtio console connected to a different connection.

### Running a Spring Boot app

> [!NOTE]
> Hawtio v4 supports Spring Boot 3.x.

You can attach the Hawtio console to your Spring Boot app with the following steps.

1. Add `io.hawt:hawtio-springboot` to the dependencies in `pom.xml`:

   ```xml
   <dependency>
     <groupId>io.hawt</groupId>
     <artifactId>hawtio-springboot</artifactId>
     <version>4.6.1</version>
   </dependency>
   ```

2. Enable the Hawtio and Jolokia endpoints by adding the following line in `application.properties`:

   ```java
   management.endpoints.web.exposure.include=hawtio,jolokia
   spring.jmx.enabled=true
   ```

Now you should be able to run Hawtio in your Spring Boot app as follows:

```console
mvn spring-boot:run
```

Opening <http://localhost:8080/actuator/hawtio> should show the Hawtio console.

See [Spring Boot example](https://github.com/hawtio/hawtio/tree/hawtio-4.6.1/examples/springboot) for a working example app.

### Running a Quarkus app

> [!NOTE]
> Hawtio v4 supports Quarkus 3.x.

You can attach the Hawtio console to your Quarkus app by adding `io.hawt:hawtio-quarkus` to the dependencies in `pom.xml`:

```xml
<dependency>
  <groupId>io.hawt</groupId>
  <artifactId>hawtio-quarkus</artifactId>
  <version>4.6.1</version>
</dependency>
```

Now you should be able to run Hawtio with your Quarkus app in development mode as follows:

```console
mvn compile quarkus:dev
```

Opening <http://localhost:8080/hawtio> should show the Hawtio console.

See [Quarkus example](https://github.com/hawtio/hawtio/tree/hawtio-4.6.1/examples/quarkus) for a working example app.

## Contributing

We love [contributions](https://hawt.io/docs/contributing)!  Here are the resources on how to get you involved in Hawtio development.

- [FAQ](https://hawt.io/docs/faq)
- [Change Log](CHANGES.md)
- [How to contribute](https://hawt.io/docs/contributing)
- [Community](https://hawt.io/community/)

Check out the [GitHub issues](https://github.com/hawtio/hawtio/issues) for finding issues to work on.

## License

Hawtio is licensed under [Apache License, Version 2.0](LICENSE.txt).

[logo]: https://hawt.io/_/img/hawtio_logo.svg "hawtio"
