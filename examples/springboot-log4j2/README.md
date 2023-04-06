# Hawtio Spring Boot 2 Example with Log4J2

This sample application shows how to run Hawtio with Spring Boot 2 and Log4J2.

## How to run

Run with:

    mvn spring-boot:run

Hawtio is exposed at the [Actuator](https://docs.spring.io/spring-boot/docs/latest/reference/html/production-ready-endpoints.html) management port configured using
`management.server.port` in `application.properties`. Browse Hawtio via the following URL: http://localhost:10001/actuator/hawtio/index.html

The actual application is running on port 10000 (`server.port` in `application.properties`).

## Alternative configurations

### Alternative management endpoint base paths
If your preference is to avoid running Hawtio under the `/actuator` path, you can set the `management.endpoints.web.base-path` property in `application.properties`:

```
management.endpoints.web.base-path=/
```

Hawtio will then be available at http://localhost:10001/hawtio/index.html.

### Alternative hawtio endpoint paths

You can also customize the endpoint path of the Hawtio actuator endpoint by setting the `management.endpoints.web.path-mapping.hawtio` property in `application.properties`:

```
management.endpoints.web.path-mapping.hawtio=hawtio/console
```

### Alternative ports & context paths
Alternative ports and context path configurations can be tested by changing the following properties in `application.properties`:

```
server.port=10000
server.servlet.context-path=/sample-app
management.port=10000
management.server.servlet.context-path=/management
```

Using the above configuration, the server will use port 10000 and the custom context path `sample-app`.
The Actuator management endpoints and Hawtio will also run on port 10000 using the custom management context path `management`.
The URLs for accessing the application and Hawtio are as follows:

- Application: http://localhost:10000/sample-app/
- Hawtio: http://localhost:10000/sample-app/management/actuator/hawtio
