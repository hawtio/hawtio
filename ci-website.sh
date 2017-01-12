#!/bin/sh

export MAVEN_OPTS="-Xmx986m"

echo ============================================================================
echo Deploying hawtio website
echo ============================================================================
#rm -rf hawtio
#git clone git@github.com:hawtio/hawtio.git hawtio && \
#cd hawtio && \
#mvn clean install && \
#cd website && \
#mvn clean scalate:sitegen scalate:deploy

cd website && \
mvn clean compile org.scalatra.scalate:maven-scalate-plugin_2.11:sitegen && \
echo 'hawt.io' > target/sitegen/CNAME && \
npm install && \
gulp
