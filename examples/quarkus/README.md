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

Or build the container image and run it (see <https://quarkus.io/guides/container-image>):
```console
mvn clean install -DskipTests -Dquarkus.container-image.build=true
podman run -p 8080:8080 quay.io/hawtio/hawtio-example-quarkus:4.5.1-SNAPSHOT
```

Hawtio is available at <http://localhost:8080/hawtio>.

By default, authentication is enabled with username `hawtio` & password `hawtio`.
This can be customized together with some of the other Hawtio configuration options by editing
[src/main/resources/application.properties](./src/main/resources/application.properties).
