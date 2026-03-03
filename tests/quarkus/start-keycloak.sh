#!/usr/bin/env bash
set -e

# 1. Use mktemp to create an isolated directory, avoiding:
# - Zombie processes holding file locks in shared /tmp
# - Permission/sticky bit issues from previous runs
# - Collisions with parallel test executions
WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT
cd "$WORK_DIR"

echo "Patching Hawtio Keycloak in isolated directory: $WORK_DIR"

# 2. Find and Extract
APP_JAR=$(ls /deployments/app/*.jar 2>/dev/null | head -n 1)
if [ -z "$APP_JAR" ]; then
    echo "ERROR: No JAR files found in /deployments/app/"
    exit 1
fi

# Use -j (junk paths) to extract just the file without directory structure
# This avoids creating META-INF or any other directories
unzip -q -j ${APP_JAR} keycloak-hawtio.json

if [ ! -f "keycloak-hawtio.json" ]; then
    echo "ERROR: keycloak-hawtio.json not found in ${APP_JAR}!"
    exit 1
fi

# 3. Patch and Verify
if [ -z "$KEYCLOAK_URL" ]; then
    echo "ERROR: KEYCLOAK_URL not set!"
    exit 1
fi

sed -i "s|http://localhost:18080|$KEYCLOAK_URL|g" keycloak-hawtio.json

if ! grep -q "$KEYCLOAK_URL" keycloak-hawtio.json; then
    echo "ERROR: Patching failed! URL not found in JSON."
    exit 1
fi

# 4. Inject using ZIP
# zip is more predictable than jar uf - it just updates the bits without
# trying to validate Java-specific metadata that causes ZipException
echo "Injecting patched config back into JAR using zip..."
zip -q ${APP_JAR} keycloak-hawtio.json

# 5. Execute with Re-augmentation (Two-Phase Startup)
# Phase 1: Augment with Keycloak enabled (this will exit after rebuild)
echo "Phase 1: Re-augmenting Quarkus with Keycloak profile..."
java -Dquarkus.profile=keycloak \
  -Dquarkus.launch.rebuild=true \
  -jar /deployments/quarkus-run.jar

# Phase 2: Start the server with the re-augmented config
echo "Phase 2: Starting Quarkus server..."
exec java ${JAVA_OPTS} \
  -Dquarkus.profile=keycloak \
  -Dquarkus.oidc.auth-server-url=$KEYCLOAK_URL/realms/hawtio-demo \
  -jar /deployments/quarkus-run.jar
