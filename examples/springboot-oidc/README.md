# Hawtio Spring Boot 4 Example with OpenID Connect authentication

This sample application shows how to run Hawtio with Spring Boot 4 with Hawtio
authentication enabled. The authentication is configured to delegate to Keycloak server.

## How to run

First an instance of [Keycloak](https://www.keycloak.org/) server should be started. The easiest way to do it is to
run it using container with a helper script provided in Hawtio examples. This script starts Keycloak and configures
it with Hawtio _realm_ that defines _clients_, _users_ and _roles_.

Run Keycloak with (starting in current directory of this example):

```console
cd ../keycloak-integration
./run-keycloak.sh
```

This script should first pull an image from quay.io/keycloak/keycloak:latest and then run a container process.
If everything runs correctly, Keycloak console should be available at <http://localhost:18080/admin/master/console/>.
Administrator credentials are `admin/admin` (defined in `examples/keycloak-integration/hawtio-demo-realm.json`).

Run the example with:

```console
mvn spring-boot:run
```

Hawtio is exposed at the [Actuator](https://docs.spring.io/spring-boot/docs/latest/reference/html/production-ready-endpoints.html) management port configured using
`management.server.port` in `application.properties`. Browse Hawtio via the following URL: <http://localhost:10001/actuator/hawtio/index.html>

The actual application is running on port 10000 (`server.port` in `application.properties`).

After browsing to <http://localhost:10001/actuator/hawtio>, there should be one login option - a button with `Keycloak@localhost` label.
This is a name for the authentication provider configured using `src/main/resources/hawtio-oidc.properties` file which
should be treated as a template.
Clicking this login option redirects to the login page of Keycloak and after logging in using `admin/admin`, we should be redirected
back to Hawtio console.

## Alternative configurations

### Alternative management endpoint base paths

If your preference is to avoid running Hawtio under the `/actuator` path, you can set the `management.endpoints.web.base-path` property in `application.properties`:

```properties
management.server.port=10001
management.endpoints.web.base-path=/
```

Hawtio will then be available at <http://localhost:10001/hawtio/index.html>.

### Alternative hawtio endpoint paths

You can also customize the endpoint path of the Hawtio actuator endpoint by setting the `management.endpoints.web.path-mapping.hawtio` property in `application.properties`:

```properties
management.server.port=10001
management.endpoints.web.base-path=/
management.endpoints.web.path-mapping.hawtio=hawtio/console
```

With the above configuration, Hawtio will be available at <http://localhost:10001/hawtio/console/index.html>.

### Alternative ports & context paths

When `management.server.port` is not specified or is the same as `server.port`, Spring Boot will configure and start only one web server and will use only one context.

In this case, we can alter the _context path_ with this configuration:

```properties
server.port=10000
server.servlet.context-path=/sample-app
```

Using the above configuration, the server will use port 10000 both for application and management endpoints and custom context path `sample-app` will be used for both.

- Application: http://localhost:10000/sample-app/
- Hawtio: http://localhost:10000/sample-app/actuator/hawtio

(`/actuator` prefix can be configured using `management.endpoints.web.base-path` property as described earlier.)

When `management.server.port` is specified and is different than `server.port`, Spring Boot will start two instances of web server and we can then configure separate context paths for application and for management endpoints.

For example:

```properties
server.port=10000
management.server.port=10001

server.servlet.context-path=/sample-app
management.server.base-path=/management
```

(`management.server.base-path` is a property that replaced `management.server.servlet.context-path`, which was deprecated in spring-projects/spring-boot@10f887a5ad696161787a60eacc5258c3f4f07263 and removed in spring-projects/spring-boot@dc5acb00191c2eac09907c39e4d890343bf9848d.)

Using the above configuration, the server will use port 10000 and the custom context path `sample-app`.
The Actuator management endpoints will run on port 10001 using custom context path `management`.
The URLs for accessing the application and Hawtio are as follows:

- Application: http://localhost:10000/sample-app/
- Hawtio: http://localhost:10001/management/actuator/hawtio

(`/actuator` prefix can be configured using `management.endpoints.web.base-path` property as described earlier.)
