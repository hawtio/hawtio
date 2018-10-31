# Hawtio Spring Boot 1 Example

This sample application shows how to run Hawtio with Spring Boot 1.

## How to run

Run with:

    mvn spring-boot:run

Hawtio is exposed at the [Actuator](https://docs.spring.io/spring-boot/docs/1.5.x/reference/html/production-ready-endpoints.html) management port configured using
`management.port` in `appplication.properties`. Browse Hawtio via the following URL: http://localhost:10001/hawtio/index.html

The actual application is running on port 10000 (`server.port` in `application.properties`).

## Alternative configurations

Alternative ports and context path configurations can be tested by changing the following properties in `application.properties`:

```
server.port              = 10000
server.contextPath       = /sample-app
management.port          = 10000
management.contextPath   = /management
```

Using the above configuration, the server will use port 10000 and the custom context path `sample-app`.
The Actuator management endpoints and Hawtio will also run on port 10000 using the custom management context path `management`.
The URLs for accessing the application and Hawtio are as follows:

- Application: http://localhost:10000/sample-app/
- Hawtio: http://localhost:10000/sample-app/management/hawtio
