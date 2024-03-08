#!/bin/sh

set -e

if [ -z "$2" ]; then
  echo "Use this script to release a Hawtio version from the snapshot main branch."
  echo ""
  echo "Usage:"
  echo "  $(basename "$0") <release_version> <next_snapshot_version> [path to m2 settings file]"
  exit
fi

RELEASE_VERSION=$1
SNAPSHOT_VERSION=$2
M2_SETTINGS=${3:-$HOME/.m2/settings.xml}

MAVEN_RELEASE_PLUGIN_VERSION=3.0.1
NEXUS_STAGING_PLUGIN_VERSION=1.6.13

echo ============================================================================
echo Building version "$RELEASE_VERSION"
echo ============================================================================

mvn -s "$M2_SETTINGS" \
  org.apache.maven.plugins:maven-release-plugin:$MAVEN_RELEASE_PLUGIN_VERSION:prepare \
  -Prelease \
  -Dtag=hawtio-"$RELEASE_VERSION" \
  -DreleaseVersion="$RELEASE_VERSION" \
  -DdevelopmentVersion="$SNAPSHOT_VERSION"

mvn -s "$M2_SETTINGS" \
  org.apache.maven.plugins:maven-release-plugin:$MAVEN_RELEASE_PLUGIN_VERSION:perform -Prelease

git push --tags

REPO_ID=$(mvn -s "$M2_SETTINGS" org.sonatype.plugins:nexus-staging-maven-plugin:$NEXUS_STAGING_PLUGIN_VERSION:rc-list -DserverId=oss-sonatype-staging -DnexusUrl=https://oss.sonatype.org | grep OPEN | grep -Eo 'iohawt-[[:digit:]]+')
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
