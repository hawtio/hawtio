ARG JAVA_VERSION=11

FROM selenium/standalone-firefox:latest as firefoxImage
USER root
RUN mkdir hawtio-test-suite
WORKDIR hawtio-test-suite
RUN export > env_init.sh
FROM selenium/standalone-chrome:latest as chromeImage

FROM maven:3-eclipse-temurin-${JAVA_VERSION}
COPY --from=firefoxImage / /

COPY --from=chromeImage / /

WORKDIR hawtio-test-suite
COPY ./ ./
RUN mvn dependency:go-offline -Pe2e -pl :hawtio-test-suite -am -P!local-test-app-dependency
RUN mvn clean install -Pe2e -DskipTests=true -pl :hawtio-test-suite -am -P!local-test-app-dependency

RUN chown root /home/seluser/

ENTRYPOINT ["bash" , "./tests/hawtio-test-suite/container_entrypoint.sh"]
