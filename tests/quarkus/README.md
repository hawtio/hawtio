# Hawtio Quarkus Example

This sample application shows how to run Hawtio with Quarkus.

## How to run

Run in development mode with:

```console
mvn compile quarkus:dev
```

Or build the project and execute the runnable JAR:

```console
mvn package && java -jar target/quarkus-app/quarkus-run.jar
```

Hawtio is available at <http://localhost:8080/hawtio>.

By default, authentication is enabled with username `hawtio` & password `hawtio`.
This can be customized together with some of the other Hawtio configuration options by editing
[src/main/resources/application.properties](./src/main/resources/application.properties).

## Camel Observability

This application includes `camel-quarkus-observability-services` which exposes the following endpoints on the Quarkus management port (9876):

- `/observe/health` — startup probe endpoint
- `/observe/health/live` — liveness probe endpoint
- `/observe/health/ready` — readiness probe endpoint
- `/observe/metrics` — metrics exposed as in Micrometer Prometheus Registry
