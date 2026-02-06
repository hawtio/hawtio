package io.hawt.tests.features.setup.deployment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.output.Slf4jLogConsumer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.utility.DockerImageName;

import io.hawt.tests.features.config.TestConfiguration;

public class DockerDeployment implements AppDeployment {

    private final String dockerImage;
    private GenericContainer<?> container;

    private static final Logger LOG = LoggerFactory.getLogger(DockerDeployment.class);

    public DockerDeployment(String dockerImage) {
        this.dockerImage = dockerImage;
        if (this.dockerImage.contains("springboot")) {
            System.setProperty(TestConfiguration.RUNTIME, "springboot");
            System.setProperty(TestConfiguration.APP_URL_SUFFIX, "/actuator/hawtio");
        }
        if (this.dockerImage.contains("quarkus")) {
            System.setProperty(TestConfiguration.RUNTIME, "quarkus");
            System.setProperty(TestConfiguration.APP_URL_SUFFIX, "/hawtio");
        }
    }

    @Override
    public void start() {
        LOG.info("Starting container {}", dockerImage);

        container = new GenericContainer<>(DockerImageName.parse(dockerImage))
            .withExposedPorts(8080, 10000, 10001)
            .withEnv("JAVA_TOOL_OPTIONS",
                "-XX:+UnlockDiagnosticVMOptions " +
                "-XX:+EnableDynamicAgentLoading")
            .waitingFor(Wait.forLogMessage(".*Hello Camel!.*", 2));

        if (TestConfiguration.useKeycloak()) {
            KeycloakDeployment.start();
            container.addEnv("KEYCLOAK_URL", KeycloakDeployment.getURL());
            container.setCommand("bash", "/deployments/start-keycloak.sh");
        }

        container.start();
        final Logger containerLogger = LoggerFactory.getLogger("hawtio-app");
        Slf4jLogConsumer logConsumer = new Slf4jLogConsumer(containerLogger);

        container.followOutput(logConsumer);

        container.waitingFor(Wait.forHttp(TestConfiguration.getUrlSuffix()));
    }

    @Override
    public void stop() {
        container.stop();
    }

    private int getPort() {
        return TestConfiguration.isQuarkus() ? 8080 : 10001;
    }

    @Override
    public String getURL() {
        return "http://" + container.getHost() + ":" + container.getMappedPort(getPort());
    }
}
