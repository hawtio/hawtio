#!/bin/sh

set -e

if [ -z "$1" ]; then
  echo "Use this script to release a Hawtio version from an existing tag."
  echo "It is normally used when a tag has been published to GitHub but"
  echo "releasing it to OSSRH has failed for some reason."
  echo ""
  echo "Usage:"
  echo "  $(basename "$0") <release_version> [path to m2 settings file]"
  exit
fi

RELEASE_VERSION=$1
M2_SETTINGS=${2:-$HOME/.m2/settings.xml}

MAVEN_RELEASE_PLUGIN_VERSION=3.0.1
NEXUS_STAGING_PLUGIN_VERSION=1.6.13

echo ============================================================================
echo Deploying version "$RELEASE_VERSION" to Sonatype OSSRH
echo ============================================================================

mvn -s "$M2_SETTINGS" \
  org.apache.maven.plugins:maven-release-plugin:$MAVEN_RELEASE_PLUGIN_VERSION:perform -Prelease \
  -DconnectionUrl=scm:git:git@github.com:hawtio/hawtio.git \
  -Dtag=hawtio-"$RELEASE_VERSION"

REPO_ID=$(mvn -s "$M2_SETTINGS" org.sonatype.plugins:nexus-staging-maven-plugin:1.6.13:rc-list -DserverId=oss-sonatype-staging -DnexusUrl=https://oss.sonatype.org | grep OPEN | grep -Eo 'iohawt-[[:digit:]]+')
if [ -z "$REPO_ID" ]; then
  echo "ERROR: Repository ID not found"
  exit 1
fi

echo ============================================================================
echo REPO_ID = "$REPO_ID"
echo ============================================================================

mvn -s "$M2_SETTINGS" \
  org.sonatype.plugins:nexus-staging-maven-plugin:$NEXUS_STAGING_PLUGIN_VERSION:rc-close \
  -DserverId=oss-sonatype-staging \
  -DnexusUrl=https://oss.sonatype.org \
  -DstagingRepositoryId="$REPO_ID" \
  -Ddescription="$RELEASE_VERSION is ready" \
  -DstagingProgressTimeoutMinutes=60

# Workaround: https://issues.sonatype.org/browse/OSSRH-66257
export MAVEN_OPTS="--add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.lang.reflect=ALL-UNNAMED --add-opens=java.base/java.text=ALL-UNNAMED --add-opens=java.desktop/java.awt.font=ALL-UNNAMED"

mvn -s "$M2_SETTINGS" \
  org.sonatype.plugins:nexus-staging-maven-plugin:$NEXUS_STAGING_PLUGIN_VERSION:rc-release \
  -DserverId=oss-sonatype-staging \
  -DnexusUrl=https://oss.sonatype.org \
  -DstagingRepositoryId="$REPO_ID" \
  -Ddescription="$RELEASE_VERSION is ready" \
  -DstagingProgressTimeoutMinutes=60
