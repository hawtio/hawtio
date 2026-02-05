# Hawtio Spring Boot Example

This sample application shows how to run Hawtio with Spring Boot.

## How to run

Run with:

```console
mvn spring-boot:run
```
Or build the project and execute the runnable JAR:

```console
mvn package && java -jar target/{generated-jar}
```

Hawtio is exposed at the [Actuator](https://docs.spring.io/spring-boot/docs/latest/reference/html/production-ready-endpoints.html) management port configured using
`management.server.port` in `application.properties`. Browse Hawtio via the following URL: <http://localhost:10001/actuator/hawtio/index.html>

The actual application is running on port 10000 (`server.port` in `application.properties`).
By default, authentication is enabled with username `hawtio` & password `hawtio`.
