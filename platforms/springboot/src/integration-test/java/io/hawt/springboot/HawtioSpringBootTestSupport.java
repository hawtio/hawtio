package io.hawt.springboot;

import io.hawt.util.Strings;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.assertj.core.api.Assertions;
import org.junit.Before;
import org.springframework.boot.actuate.autoconfigure.endpoint.EndpointAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.endpoint.web.WebEndpointAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.jolokia.JolokiaEndpointAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.web.server.ManagementContextAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.web.servlet.ServletManagementContextAutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.http.HttpMessageConvertersAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.DispatcherServletAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.ServletWebServerFactoryAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.boot.test.context.assertj.AssertableWebApplicationContext;
import org.springframework.boot.test.context.runner.WebApplicationContextRunner;
import org.springframework.boot.web.servlet.context.AnnotationConfigServletWebServerApplicationContext;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.util.SocketUtils;

public class HawtioSpringBootTestSupport {

    public static final int SERVER_PORT = SocketUtils.findAvailableTcpPort();
    public static final int MANAGEMENT_PORT = SocketUtils.findAvailableTcpPort(SERVER_PORT + 1);

    protected WebApplicationContextRunner contextRunner;

    @Before
    public void setUp() {
        contextRunner = new WebApplicationContextRunner(
            AnnotationConfigServletWebServerApplicationContext::new)
            .withConfiguration(AutoConfigurations.of(
                DispatcherServletAutoConfiguration.class,
                EndpointAutoConfiguration.class,
                JolokiaEndpointAutoConfiguration.class,
                ManagementContextAutoConfiguration.class,
                ServletManagementContextAutoConfiguration.class,
                ServletWebServerFactoryAutoConfiguration.class,
                WebEndpointAutoConfiguration.class,
                WebMvcAutoConfiguration.class,
                HttpMessageConvertersAutoConfiguration.class,
                HawtioEndpointAutoConfiguration.class,
                HawtioManagementConfiguration.class
            )
        );
    }

    protected WebApplicationContextRunner getContextRunner() {
        return this.contextRunner;
    }

    protected void assertHawtioEndpointPaths(AssertableWebApplicationContext context, TestProperties properties) {
        testHawtioEndpoint(context, properties);
        testHawtioJolokiaRequest(context, properties);
        testHawtioPluginRequest(context, properties);
        testJolokiaRequest(context, properties);
    }

    public void testHawtioEndpoint(AssertableWebApplicationContext context, TestProperties properties) {
        getTestClient(context)
            .get().uri(properties.getHawtioPath()).exchange()
            .expectStatus().isOk()
            .expectBody()
            .consumeWith(result -> {
                String body = new String(result.getResponseBody(), StandardCharsets.UTF_8);
                Assertions.assertThat(body).contains("<base href='" + properties.getHawtioPath() + "/'>");
            });
    }

    public void testJolokiaRequest(AssertableWebApplicationContext context, TestProperties properties) {
        getTestClient(context)
            .get().uri(properties.getJolokiaPath()).exchange()
            .expectStatus().isOk();
    }

    public void testHawtioJolokiaRequest(AssertableWebApplicationContext context, TestProperties properties) {
        getTestClient(context)
            .get().uri(properties.getHawtioJolokiaPath()).exchange()
            .expectStatus().isOk();
    }

    public void testHawtioPluginRequest(AssertableWebApplicationContext context, TestProperties properties) {
        getTestClient(context)
            .get()
            .uri(properties.getHawtioPluginPath())
            .exchange()
            .expectStatus().isOk()
            .expectBody().json("[]");
    }

    protected WebTestClient getTestClient(AssertableWebApplicationContext context) {
        Integer port = context.getEnvironment().getProperty("management.server.port", Integer.class);
        if (port == null) {
            port = context.getSourceApplicationContext(AnnotationConfigServletWebServerApplicationContext.class).getWebServer().getPort();
        }
        return WebTestClient.bindToServer().baseUrl("http://localhost:" + port).build();
    }

    protected static class TestProperties {
        private final List<String> properties = new ArrayList<>();
        private final String contextPath;
        private final String servletPath;
        private final String managementContextPath;
        private final String managementBasePath;
        private String jolokiaPath = "jolokia";
        private String hawtioPath = "hawtio";

        private TestProperties(final String contextPath,
                final String servletPath, final String managementContextPath,
                final String managementBasePath, final String jolokiaPath,
                final String hawtioPath, final boolean hawtioExposed, final boolean jolokiaExposed,
                final boolean hawtioEnabled, final boolean jolokiaEnabled,
                final boolean authenticationEnabled) {

            List<String> endpoints = new ArrayList<>();
            if (hawtioExposed) {
                endpoints.add("hawtio");
            }

            if (jolokiaExposed) {
                endpoints.add("jolokia");
            }

            if (!endpoints.isEmpty()) {
                addProperty("management.endpoints.web.exposure.include", String.join(",", endpoints));
            }

            if (!hawtioEnabled) {
                addProperty("management.endpoint.hawtio.enabled", "false");
            }

            if (!jolokiaEnabled) {
                addProperty("management.endpoint.jolokia.enabled", "false");
            }

            addProperty("server.port", String.valueOf(SERVER_PORT));
            addProperty("server.servlet.context-path", contextPath);
            addProperty("spring.mvc.servlet.path", servletPath);
            addProperty("management.server.servlet.context-path", managementContextPath);
            addProperty("management.endpoints.web.base-path", managementBasePath);
            addProperty("management.endpoints.web.path-mapping.jolokia", jolokiaPath);
            addProperty("management.endpoints.web.path-mapping.hawtio", hawtioPath);
            addProperty("hawtio.authenticationEnabled", String.valueOf(authenticationEnabled));

            this.contextPath = contextPath;
            this.servletPath = servletPath;
            this.managementContextPath = managementContextPath;

            if (managementBasePath != null) {
                this.managementBasePath = managementBasePath;
            } else {
                this.managementBasePath = "/actuator";
            }

            if (jolokiaPath != null) {
                this.jolokiaPath = Strings.webContextPath(jolokiaPath);
            }

            if (hawtioPath != null) {
                this.hawtioPath = Strings.webContextPath(hawtioPath);
            }
        }

        public static TestPropertiesBuilder builder() {
            return new TestPropertiesBuilder();
        }

        public String getHawtioPath() {
            return Strings.webContextPath(getBasePath(), hawtioPath);
        }

        public String getJolokiaPath() {
            return Strings.webContextPath(getBasePath(), jolokiaPath);
        }

        public String getHawtioJolokiaPath() {
            return Strings.webContextPath(getHawtioPath(), "jolokia");
        }

        public String getHawtioPluginPath() {
            return Strings.webContextPath(getHawtioPath(), "plugin");
        }

        public String[] getProperties() {
            return this.properties.toArray(new String[]{});
        }

        private String getBasePath() {
            return Strings.webContextPath(contextPath, servletPath, managementContextPath, managementBasePath);
        }

        private void addProperty(String name, String value) {
            if (value != null) {
                this.properties.add(name + "=" + value);
            }
        }
    }

    protected static class TestPropertiesBuilder {
        private String contextPath;
        private String servletPath;
        private String managementContextPath;
        private String managementBasePath;
        private String jolokiaPath;
        private String hawtioPath;
        private boolean hawtioExposed = true;
        private boolean jolokiaExposed = true;
        private boolean hawtioEnabled = true;
        private boolean jolokiaEnabled = true;
        private boolean authenticationEnabled;

        public TestPropertiesBuilder contextPath(String contextPath) {
            this.contextPath = contextPath;
            return this;
        }

        public TestPropertiesBuilder servletPath(String servletPath) {
            this.servletPath = servletPath;
            return this;
        }

        public TestPropertiesBuilder managementContextPath(String managementContextPath) {
            this.managementContextPath = managementContextPath;
            return this;
        }

        public TestPropertiesBuilder managementBasePath(String managementBasePath) {
            this.managementBasePath = managementBasePath;
            return this;
        }

        public TestPropertiesBuilder jolokiaPath(String jolokiaPath) {
            this.jolokiaPath = jolokiaPath;
            return this;
        }

        public TestPropertiesBuilder hawtioPath(String hawtioPath) {
            this.hawtioPath = hawtioPath;
            return this;
        }

        public TestPropertiesBuilder hawtioExposed(boolean exposed) {
            this.hawtioExposed = exposed;
            return this;
        }

        public TestPropertiesBuilder jolokiaExposed(boolean exposed) {
            this.jolokiaExposed = exposed;
            return this;
        }

        public TestPropertiesBuilder hawtioEnabled(boolean enabled) {
            this.hawtioEnabled = enabled;
            return this;
        }

        public TestPropertiesBuilder jolokiaEnabled(boolean enabled) {
            this.jolokiaEnabled = enabled;
            return this;
        }

        public TestPropertiesBuilder authenticationEnabled(boolean enabled) {
            this.authenticationEnabled = enabled;
            return this;
        }

        public TestProperties build() {
            return new TestProperties(contextPath, servletPath, managementContextPath,
                managementBasePath, jolokiaPath, hawtioPath, hawtioExposed,
                jolokiaExposed, hawtioEnabled, jolokiaEnabled, authenticationEnabled);
        }
    }
}
