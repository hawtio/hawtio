ARG JAVA_VERSION=11
FROM registry.access.redhat.com/ubi8/openjdk-${JAVA_VERSION}

ENV LANGUAGE='en_US:en'

COPY --chown=185 target/hawtio-tests-springboot-3.0-SNAPSHOT.jar /deployments/hawtio-springboot.jar

EXPOSE 8080 10001 10000
USER 185
ENV AB_JOLOKIA_OFF=""
ENV JAVA_APP_JAR="/deployments/hawtio-springboot.jar"

