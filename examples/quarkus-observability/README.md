# Hawtio Quarkus Camel Observability Example

This sample application shows how to run Hawtio with Quarkus and Camel Observability.

## Camel Observability dependency

This example includes `camel-quarkus-observability-services` which provides health checks, metrics, and OpenTelemetry tracing for Camel routes:

```xml
<dependency>
    <groupId>org.apache.camel.quarkus</groupId>
    <artifactId>camel-quarkus-observability-services</artifactId>
</dependency>
```

## How to run

Run in development mode with:

```console
mvn compile quarkus:dev
```

Or build the project and execute the runnable JAR:

```console
mvn package && java -jar target/quarkus-app/quarkus-run.jar
```

Or build the container image and run it (see <https://quarkus.io/guides/container-image>):
```console
mvn clean install -DskipTests -Dquarkus.container-image.build=true
podman run -p 8080:8080 -p 9876:9876 quay.io/hawtio/hawtio-example-quarkus:5.3-SNAPSHOT
```

Hawtio is available at <http://localhost:8080/hawtio>.

By default, authentication is enabled with username `hawtio` & password `hawtio`.
This can be customized together with some of the other Hawtio configuration options by editing
[src/main/resources/application.properties](./src/main/resources/application.properties).

### Observability endpoints

The following observability endpoints are available on the management port and can be accessed via a browser or `curl`:

- <http://localhost:9876/observe/metrics> — Prometheus metrics
- <http://localhost:9876/observe/health> — overall health status
- <http://localhost:9876/observe/health/live> — liveness probe
- <http://localhost:9876/observe/health/ready> — readiness probe
