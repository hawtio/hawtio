ARG IMAGE_VERSION=17
ARG IMAGE=eclipse-temurin
FROM ${IMAGE}:${IMAGE_VERSION}

ENV LANGUAGE='en_US:en'

COPY --chown=185 target/hawtio-tests-springboot-4.0-SNAPSHOT.jar /deployments/hawtio-springboot.jar

EXPOSE 8080 10001 10000
USER 185
ENV AB_JOLOKIA_OFF=""
ENV JAVA_APP_JAR="/deployments/hawtio-springboot.jar"

CMD java -jar ${JAVA_OPTS} ${JAVA_APP_JAR}
