#!/usr/bin/env bash

cd /tmp
jar xf /deployments/app/*.jar keycloak-hawtio.json
sed -i s,http://localhost:18080,$KEYCLOAK_URL, keycloak-hawtio.json
jar uf  /deployments/app/*.jar keycloak-hawtio.json
echo "Running: java ${JAVA_OPTS} -Dquarkus.profile=keycloak -Dquarkus.oidc.auth-server-url=$KEYCLOAK_URL/realms/hawtio-demo -jar ${JAVA_APP_JAR}"
java ${JAVA_OPTS} -Dquarkus.profile=keycloak -Dquarkus.oidc.auth-server-url=$KEYCLOAK_URL/realms/hawtio-demo -jar ${JAVA_APP_JAR}
