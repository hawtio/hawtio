#!/bin/sh

RELEASE_VERSION=$1
M2_SETTINGS=${2:-$HOME/.m2/settings.xml}

echo ============================================================================
echo Building version $RELEASE_VERSION
echo ============================================================================

rm -rf hawtio-1.x
git clone -b 1.x git@github.com:hawtio/hawtio.git hawtio-1.x && \
cd hawtio-1.x && \
mvn -s $M2_SETTINGS --batch-mode \
  org.apache.maven.plugins:maven-release-plugin:2.5:prepare \
  -Prelease,watcher \
  -Dtag=hawtio-$RELEASE_VERSION \
  -DreleaseVersion=$RELEASE_VERSION \
  -DdevelopmentVersion=1.5-SNAPSHOT && \
mvn -s $M2_SETTINGS --batch-mode org.apache.maven.plugins:maven-release-plugin:2.5:perform -Prelease,watcher && \
git push --tags && \
REPO_ID=$(mvn -s $M2_SETTINGS org.sonatype.plugins:nexus-staging-maven-plugin:1.6.5:rc-list -DserverId=oss-sonatype-staging -DnexusUrl=https://oss.sonatype.org | grep OPEN | grep -Eo 'iohawt-[[:digit:]]+') && \
mvn -s $M2_SETTINGS org.sonatype.plugins:nexus-staging-maven-plugin:1.6.5:rc-close -DserverId=oss-sonatype-staging -DnexusUrl=https://oss.sonatype.org -DstagingRepositoryId=${REPO_ID} -Ddescription="${release_version} is ready" -DstagingProgressTimeoutMinutes=60 && \
mvn -s $M2_SETTINGS org.sonatype.plugins:nexus-staging-maven-plugin:1.6.5:rc-release -DserverId=oss-sonatype-staging -DnexusUrl=https://oss.sonatype.org -DstagingRepositoryId=${REPO_ID} -Ddescription="${release_version} is ready" -DstagingProgressTimeoutMinutes=60
