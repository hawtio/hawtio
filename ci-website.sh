#!/bin/sh

export MAVEN_OPTS="-Xmx986m -XX:MaxPermSize=350m"

echo ============================================================================
echo Deploying hawtio website
echo ============================================================================
rm -rf hawtio
git clone git@github.com:hawtio/hawtio.git hawtio && \
cd hawtio && \
mvn clean install && \
cd website && \
mvn clean scalate:sitegen scalate:deploy