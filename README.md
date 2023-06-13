![hawtio][logo]

[![Test](https://github.com/hawtio/hawtio/actions/workflows/test.yml/badge.svg)](https://github.com/hawtio/hawtio/actions/workflows/test.yml)

## Introduction

[Hawtio](http://hawt.io) is a lightweight and modular Web console for managing Java applications.

![Hawtio screenshot](https://raw.githubusercontent.com/hawtio/website/main/static/images/screenshots/camel-route.png)

Hawtio has [lots of plugins](http://hawt.io/docs/plugins/) such as: Apache ActiveMQ "Classic," Apache Camel, JMX, OSGi, Logs, Spring Boot, and Diagnostics.
You can dynamically extend Hawtio with your own plugins or automatically discover plugins inside the JVM.

The only server side dependency (other than the static HTML/CSS/JS/images) is the excellent [Jolokia library](http://jolokia.org) which has small footprint (around 300KB) and is available as a [JVM agent](http://jolokia.org/agent/jvm.html), or comes embedded as a servlet inside the `hawtio-default.war` or can be deployed as [an OSGi bundle](http://jolokia.org/agent/osgi.html).

## Get Started

- [Running an executable JAR](#running-an-executable-jar)
- [Running a Spring Boot app](#running-a-spring-boot-app)
- [Deploying on OpenShift](https://github.com/hawtio/hawtio-online)

For more details and other containers, see [Get Started Guide](http://hawt.io/docs/get-started/).

### Running an executable JAR

You can start up Hawtio on your machine using the following jbang command.

```
jbang app install hawtio@hawtio/hawtio
hawtio --help
```

### Running a Spring Boot app

Attaching the Hawtio console to your Spring Boot app is simple.

1. Add `io.hawt:hawtio-springboot` to the dependencies in `pom.xml`:

       <dependency>
         <groupId>io.hawt</groupId>
         <artifactId>hawtio-springboot</artifactId>
         <version>3.0-M1</version>
       </dependency>

2. Enable the Hawtio and Jolokia endpoints by adding the following line in `application.properties`:

       management.endpoints.web.exposure.include=hawtio,jolokia
       spring.jmx.enabled=true

Now you should be able to run Hawtio in your Spring Boot app as follows:

    mvn spring-boot:run

Opening <http://localhost:8080/actuator/hawtio> should show the Hawtio console.

See [Spring Boot example](https://github.com/hawtio/hawtio/tree/hawtio-3.0-M1/examples/springboot) for a working example app.

## Contributing

We love [contributions](http://hawt.io/docs/contributing/)!  Here are the resources on how to get you involved in Hawtio development.

- [FAQ](http://hawt.io/docs/faq/)
- [Change Log](CHANGES.md)
- [How to contribute](http://hawt.io/docs/contributing/)
- [Community](http://hawt.io/community/)

Check out the [GitHub issues](https://github.com/hawtio/hawtio/issues) for finding issues to work on.

## License

Hawtio is licensed under [Apache License, Version 2.0](LICENSE.txt).

[logo]: http://hawt.io/images/hawtio_logo.svg "hawtio"
