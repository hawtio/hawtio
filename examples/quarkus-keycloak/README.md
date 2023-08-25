# Hawtio Quarkus with Keycloak Authentication Example

This sample application shows how to run Hawtio with Quarkus and Keycloak authentication.

## How to run

### Start Keycloak server

Before running this example application, you need to have a Keycloak server up and running. You can start up the Keycloak server in whatever way you like, but here we show how to do it with Docker:

```console
docker run --rm -p 18080:8080 --name keycloak \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v "../keycloak-integration/hawtio-demo-realm.json":/opt/keycloak/data/import/hawtio-demo-realm.json:Z \
  quay.io/keycloak/keycloak \
  -v start-dev --import-realm
```

Here we use port number `18080` for the Keycloak server to avoid potential conflicts with the ports other applications might use.

You can log in to the Keycloak admin console <http://localhost:18080/admin/> with user `admin` / password `admin`.

The `hawtio-demo` realm is imported from [hawtio-demo-realm.json](../keycloak-integration/hawtio-demo-realm.json) located in the `keycloak-integration` example directory. This realm has the `hawtio-client` application installed as a public client, and defines a couple of realm roles such as `admin` and `viewer`. The names of these roles are the same as the default Hawtio roles, which are allowed to login into Hawtio admin console and to JMX.

> [!NOTE]
> Currently, the difference in roles does not affect Hawtio access rights on Quarkus, as Hawtio RBAC functionality is not yet implemented on Quarkus.

There are also 3 users predefined:

- `admin` with password `admin` and role `admin`, who is allowed to login into Hawtio
- `viewer` with password `viewer` and role `viewer`, who is allowed to login into Hawtio
- `jdoe` with password `password` and no role assigned, who is not allowed to login into Hawtio

### Run the application

Once you started a Keycloak server, run the application in development mode with:

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
