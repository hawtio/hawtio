#!/bin/sh

export MAVEN_OPTS="-Xmx986m"

echo ============================================================================
echo Creating hawtio release: ${release_version}
echo ============================================================================

rm -rf hawtio
git clone git@github.com:hawtio/hawtio.git hawtio && \
cd hawtio && \
mvn --batch-mode \
  org.apache.maven.plugins:maven-release-plugin:2.5:prepare \
  -Prelease,watcher \
  -Dtag=hawtio-${release_version} \
  -DreleaseVersion=${release_version} \
  -DdevelopmentVersion=1.5-SNAPSHOT && \
mvn --batch-mode org.apache.maven.plugins:maven-release-plugin:2.5:perform -Prelease,watcher && \
git push --tags
