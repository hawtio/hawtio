package io.hawt.tests.features.config;

import org.junit.Assume;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Path;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Supplier;

import io.hawt.tests.features.setup.deployment.AppDeployment;
import io.hawt.tests.features.setup.deployment.DockerDeployment;
import io.hawt.tests.features.setup.deployment.MavenDeployment;
import io.hawt.tests.features.setup.deployment.URLDeployment;

public class TestConfiguration {

    private static final Logger LOG = LoggerFactory.getLogger(TestConfiguration.class);

    public static final String RUNTIME = "io.hawt.test.runtime";
    public static final String APP_DOCKER_IMAGE = "io.hawt.test.docker.image";
    public static final String APP_PATH = "io.hawt.test.app.path";
    public static final String APP_URL = "io.hawt.test.url";
    public static final String APP_URL_SUFFIX = "io.hawt.test.url.suffix";
    public static final String APP_USERNAME = "io.hawt.test.username";
    public static final String APP_PASSWORD = "io.hawt.test.password";

    public static final String BROWSER_HEADLESS = "io.hawt.test.browser.headless";

    public static final String CONNECT_URL = "io.hawt.test.app.connect.url";
    public static final String CONNECT_APP_USERNAME = "io.hawt.test.app.connect.username";
    public static final String CONNECT_APP_PASSWORD = "io.hawt.test.app.connect.password";
    
    public static String getUrlSuffix() {
        if (getAppDeploymentMethod() instanceof URLDeployment) {
            return "";
        }
        return getRequiredProperty(APP_URL_SUFFIX);
    }

    public static boolean browserHeadless() {
        return Boolean.parseBoolean(getProperty(BROWSER_HEADLESS, "false"));
    }

    public static AppDeployment getAppDeploymentMethod() {
        if (hasProperty(APP_URL)) {
            return new URLDeployment(getRequiredProperty(APP_URL));
        }
        if (hasProperty(APP_DOCKER_IMAGE)){
            return new DockerDeployment(getRequiredProperty(APP_DOCKER_IMAGE));
        }
        if (isRunningInContainer()) {
            throw new RuntimeException("Containerized testsuite can't run maven application from inside the container, specify URL or a Docker image");
        }

        if (hasProperty(APP_PATH)) {
            return new MavenDeployment(getRequiredProperty(APP_PATH));
        }

        if (hasProperty(RUNTIME) && getRequiredProperty(RUNTIME).toLowerCase().matches("quarkus|springboot")) {
            final String path = Path.of("").toAbsolutePath().getParent().resolve(getRequiredProperty(RUNTIME)).resolve("target").toString();
            return new MavenDeployment(path);
        }

        LOG.error("Invalid configuration for tested app deployment");
        Assume.assumeTrue("Invalid configuration for tested app deployment",false);
        return null;
    }

    public static boolean isQuarkus() {
        return "quarkus".equalsIgnoreCase(getRequiredProperty(RUNTIME));
    }

    public static boolean isSpringboot() {
        return "springboot".equalsIgnoreCase(getRequiredProperty(RUNTIME));
    }

    public static boolean isRunningInContainer() {
        return hasProperty("hawtio-container");
    }

    public static URL getConnectUrl() {
        if (hasProperty(CONNECT_URL)) {
            final String value = getRequiredProperty(CONNECT_URL);
            try {
                return new URL(value);
            } catch (MalformedURLException e) {
                throw new RuntimeException(e);
            }
        }
        return null;
    }

    public static String getConnectAppUsername() {
        return getProperty(CONNECT_APP_USERNAME, TestConfiguration::getAppUsername);
    }

    public static String getConnectAppPassword() {
        return getProperty(CONNECT_APP_PASSWORD, TestConfiguration::getAppPassword);
    }

    public static String getAppUsername() {
        return getProperty(APP_USERNAME, "hawtio");
    }

    public static String getAppPassword() {
        return getProperty(APP_PASSWORD, "hawtio");
    }

    public static String getRequiredProperty(String name) {
        return Objects.requireNonNull(System.getProperty(name), String.format("Missing required property value '%s'!", name));
    }

    public static Optional<String> getOptionalProperty(String name) {
        return Optional.ofNullable(System.getProperty(name));
    }
    public static boolean hasProperty(String name) {
        return System.getProperty(name) != null;
    }

    public static String getProperty(String name, Supplier<String> defaultValue) {
        return Optional.ofNullable(System.getProperty(name)).orElseGet(defaultValue);
    }

    public static String getProperty(String name, String defaultValue) {
        return System.getProperty(name, defaultValue);
    }
}
