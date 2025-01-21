#!/usr/bin/env bash

cd /tmp
jar xf /deployments/app/*.jar keycloak-hawtio.json
sed -i s,http://localhost:18080,$KEYCLOAK_URL, keycloak-hawtio.json
jar uf  /deployments/app/*.jar keycloak-hawtio.json
java -Dquarkus.profile=keycloak -Dquarkus.launch.rebuild=true -jar ${JAVA_APP_JAR}
echo "Running: java -jar ${JAVA_OPTS} -Dquarkus.oidc.auth-server-url=$KEYCLOAK_URL/realms/hawtio-demo ${JAVA_APP_JAR}"
java -jar ${JAVA_OPTS} -Dquarkus.oidc.auth-server-url=$KEYCLOAK_URL/realms/hawtio-demo ${JAVA_APP_JAR}
