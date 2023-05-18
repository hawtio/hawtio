# Hawtio Spring Boot 2 with Plugin Example

This sample application demonstrates how to write and use a custom plugin with Spring Boot 2.

## Key components

The key components of this sample are as follows:

| File/Directory | Description |
| -------------- | ----------- |
| [../sample-plugin/](../sample-plugin) | The Hawtio v3 plugin project written in TypeScript. Since a Hawtio plugin is based on React and [Webpack Module Federation](https://module-federation.github.io/), this project uses Yarn v3 and [CRACO](https://craco.js.org/) as the build tools. You can use any JS/TS tools for developing a Hawtio plugin so long as they can build a React and Webpack Module Federation application. |
| [SampleSpringBootService.java](./src/main/java/io/hawt/example/spring/boot/SampleSpringBootService.java) | This is where the application registers the plugin to Hawtio. To register a plugin in Spring Boot, it should create the Spring Boot version of [HawtioPlugin](https://github.com/hawtio/hawtio/blob/hawtio-3.0-M3/platforms/springboot/src/main/java/io/hawt/springboot/HawtioPlugin.java) and provide it to Spring context. The three key parameters to pass to `HawtioPlugin` are `url`, `scope`, and `module`, which are required by Module Federation. |

## How to run

Run with:

```console
mvn spring-boot:run
```

Hawtio is exposed at the [Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html) management port configured using
`management.server.port` in `application.properties`. Browse Hawtio via the following URL: <http://localhost:10001/actuator/hawtio/>

The actual application is running on port 10000 (`server.port` in `application.properties`).

## Alternative configurations

### Alternative management endpoint base paths

If your preference is to avoid running Hawtio under the `/actuator` path, you can set the `management.endpoints.web.base-path` property in `application.properties`:

```java
management.endpoints.web.base-path=/
```

Hawtio will then be available at <http://localhost:10001/hawtio/>.

### Alternative hawtio endpoint paths

You can also customize the endpoint path of the Hawtio actuator endpoint by setting the `management.endpoints.web.path-mapping.hawtio` property in `application.properties`:

```java
management.endpoints.web.path-mapping.hawtio=hawtio/console
```

### Alternative ports & context paths

Alternative ports and context path configurations can be tested by changing the following properties in `application.properties`:

```java
server.port=10000
server.servlet.context-path=/sample-app
management.port=10000
management.server.servlet.context-path=/management
```

Using the above configuration, the server will use port 10000 and the custom context path `sample-app`.
The Actuator management endpoints and Hawtio will also run on port 10000 using the custom management context path `management`.
The URLs for accessing the application and Hawtio are as follows:

- Application: <http://localhost:10000/sample-app/>
- Hawtio: <http://localhost:10000/sample-app/management/actuator/hawtio>
