#!/bin/sh

if [ -z $1 ]; then
    echo "Usage:"
    echo "  ./run-hawtio.sh <path to hawtio-app.jar>"
    exit 1
fi

HOME=`cd $(dirname $0); pwd`

JAVA_OPTS="$JAVA_OPTS -Dhawtio.authenticationEnabled=true"
JAVA_OPTS="$JAVA_OPTS -Dhawtio.realm=hawtio"
JAVA_OPTS="$JAVA_OPTS -Dhawtio.keycloakEnabled=true"
JAVA_OPTS="$JAVA_OPTS -Dhawtio.roles=admin,manager,viewer"
JAVA_OPTS="$JAVA_OPTS -Dhawtio.rolePrincipalClasses=org.keycloak.adapters.jaas.RolePrincipal"
JAVA_OPTS="$JAVA_OPTS -Dhawtio.keycloakClientConfig=$HOME/keycloak-hawtio.json"
JAVA_OPTS="$JAVA_OPTS -Dhawtio.keycloakServerConfig=$HOME/keycloak-bearer.json"
JAVA_OPTS="$JAVA_OPTS -Djava.security.auth.login.config=$HOME/login.conf"

echo =========================================================================
echo
echo "  hawtio integration with Keycloak"
echo
echo "  java $JAVA_OPTS -jar $*"
echo
echo =========================================================================
java $JAVA_OPTS -jar $*
