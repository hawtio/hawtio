#!/usr/bin/env bash

# Perform the JAR update in the writable tmp directory
cd /deployments/tmp
jar xf /deployments/app/*.jar keycloak-hawtio.json
sed -i s,http://localhost:18080,$KEYCLOAK_URL, keycloak-hawtio.json
jar uf  /deployments/app/*.jar keycloak-hawtio.json

# Return to workdir and launch with the REBUILD flag
cd /deployments
echo "Launching with Reaugmentation (Mutable-Jar mode)..."

java ${JAVA_OPTS} \
     -Dquarkus.profile=keycloak \
     -Dquarkus.launch.rebuild=true \
     -Dquarkus.oidc.auth-server-url=$KEYCLOAK_URL/realms/hawtio-demo \
     -jar ${JAVA_APP_JAR}
