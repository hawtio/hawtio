package io.hawt.tests.features.config;

import org.junit.Assume;

import org.assertj.core.api.Assertions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testcontainers.shaded.org.apache.commons.lang3.RandomStringUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Supplier;

import io.hawt.tests.features.setup.deployment.AppDeployment;
import io.hawt.tests.features.setup.deployment.DockerDeployment;
import io.hawt.tests.features.setup.deployment.MavenDeployment;
import io.hawt.tests.features.setup.deployment.OpenshiftDeployment;
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

    public static final String USE_OPENSHIFT = "io.hawt.test.use.openshift";
    public static final String OPENSHIFT_URL = "io.hawt.test.openshift.url";
    public static final String OPENSHIFT_USERNAME = "io.hawt.test.openshift.username";
    public static final String OPENSHIFT_PASSWORD = "io.hawt.test.openshift.password";
    public static final String OPENSHIFT_NAMESPACE = "io.hawt.test.openshift.namespace";
    public static final String OPENSHIFT_KUBECONFIG = "io.hawt.test.openshift.kubeconfig";
    public static final String OPENSHIFT_NAMESPACE_DELETE = "io.hawt.test.openshift.namespace.delete";
    public static final String OPENSHIFT_INDEX_IMAGE = "io.hawt.test.openshift.index.image";

    public static final String CAMEL_K_CATALOG = "io.hawt.test.camelk.catalog";
    private static final String NAMESPACE_PREFIX = "hawtio-tests-";

    private static AppDeployment deployment;

    public static String getUrlSuffix() {
        if (getAppDeploymentMethod() instanceof URLDeployment) {
            return "";
        }
        if (getAppDeploymentMethod() instanceof OpenshiftDeployment) {
            return "/online";
        }
        return getRequiredProperty(APP_URL_SUFFIX);
    }

    public static boolean browserHeadless() {
        return Boolean.parseBoolean(getProperty(BROWSER_HEADLESS, "false"));
    }

    public static AppDeployment getAppDeploymentMethod() {
        if (deployment != null) {
            return deployment;
        }
        if (hasProperty(APP_URL)) {
            deployment = new URLDeployment(getRequiredProperty(APP_URL));
            return deployment;
        }
        if (hasProperty(APP_DOCKER_IMAGE)){
            deployment = new DockerDeployment(getRequiredProperty(APP_DOCKER_IMAGE));
            return deployment;
        }
        if (isRunningInContainer()) {
            throw new RuntimeException("Containerized testsuite can't run maven application from inside the container, specify URL or a Docker image");
        }

        if (useOpenshift()) {
            deployment = new OpenshiftDeployment();
            return deployment;
        }

        if (hasProperty(APP_PATH)) {
            deployment = new MavenDeployment(getRequiredProperty(APP_PATH));
            return deployment;
        }

        if (hasProperty(RUNTIME) && getRequiredProperty(RUNTIME).toLowerCase().matches("quarkus|springboot")) {
            final String path = Path.of("").toAbsolutePath().getParent().resolve(getRequiredProperty(RUNTIME)).resolve("target").toString();
            deployment = new MavenDeployment(path);
            return deployment;
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

    public static String getHawtioOnlineSHA() {
        return getProperty("io.hawt.test.online.sha");
    }

    public static String getHawtioOnlineImageRepository() {
        return getProperty("io.hawt.test.online.image.repository");
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

    public static boolean useOpenshift() {
        return getBoolean(USE_OPENSHIFT, false);
    }

    public static String getIndexImage() {
        return getProperty(OPENSHIFT_INDEX_IMAGE);
    }

    private static Boolean getBoolean(String name, boolean defaultValue) {
        return getOptionalProperty(name).map(Boolean::parseBoolean).orElse(defaultValue);
    }

    public static String getOpenshiftUrl() {
        return getProperty(OPENSHIFT_URL);
    }

    public static String getOpenshiftUsername() {
        return getProperty(OPENSHIFT_USERNAME, "admin");
    }

    public static String getOpenshiftPassword() {
        return getProperty(OPENSHIFT_PASSWORD, "admin");
    }

    public static String getOpenshiftNamespace() {
        if (getOptionalProperty(OPENSHIFT_NAMESPACE).isEmpty()) {
            System.setProperty(OPENSHIFT_NAMESPACE, NAMESPACE_PREFIX + RandomStringUtils.randomAlphabetic(5).toLowerCase());
        }

        return getRequiredProperty(OPENSHIFT_NAMESPACE);
    }

    public static Path openshiftKubeconfig() {
        String kubeconfig = getProperty(OPENSHIFT_KUBECONFIG, getProperty("kubeconfig"));
        return kubeconfig == null ? null : Paths.get(kubeconfig);
    }

    public static boolean openshiftNamespaceDelete() {
        return getBoolean(OPENSHIFT_NAMESPACE_DELETE, true);
    }


    public static String getCamelKCatalog() {
        return getProperty(CAMEL_K_CATALOG, "redhat-operators");
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

    public static String getProperty(String name) {
        return getProperty(name, (String) null);
    }

    public static String getProperty(String name, String defaultValue) {
        return System.getProperty(name, defaultValue);
    }

    public static String getRuntime() {
        return getRequiredProperty(RUNTIME);
    }

    public static String getNeedleForLogs() {
        return isSpringboot() ? "Started SpringBootService" : "(SampleCamel) started";
    }
}
