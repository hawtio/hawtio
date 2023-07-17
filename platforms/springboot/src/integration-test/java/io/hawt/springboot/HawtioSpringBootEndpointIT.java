package io.hawt.springboot;

import org.junit.Test;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.context.support.ServletContextPropertySource;

public class HawtioSpringBootEndpointIT extends HawtioSpringBootTestCommon {

    @Test
    public void testConfigurationDefaults() {
        TestProperties properties = TestProperties.builder().build();

        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, this.isCustomManagementPortConfigured));
    }

    @Test
    public void testCustomManagementBasePath() {
        TestProperties properties = TestProperties.builder()
            .managementWebBasePath("/actuator")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, this.isCustomManagementPortConfigured));
    }

    @Test
    public void testRootManagementBasePath() {
        TestProperties properties = TestProperties.builder()
            .managementWebBasePath("/")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, isCustomManagementPortConfigured));
    }

    @Test
    public void testJolokiaEndpointNotExposed() {
        TestProperties properties = TestProperties.builder()
            .jolokiaExposed(false)
            .build();

        getContextRunner().withPropertyValues(properties.getProperties()).run((context) -> {
            WebTestClient client = getTestClient(context);

            client.get().uri(properties.getJolokiaPath(false)).exchange()
                .expectStatus().isNotFound();

            client.get().uri(properties.getHawtioJolokiaPath(false)).exchange()
                .expectStatus().isNotFound();
        });
    }

    @Test
    public void testHawtioAuthenticationEnabled() {
        TestProperties properties = TestProperties.builder()
            .authenticationEnabled(true)
            .build();

        getContextRunner().withPropertyValues(properties.getProperties()).run((context) -> {
            String loginRedirectUrlRegex = "http://localhost:[0-9]+/context/actuator/hawtio/auth/login";
            WebTestClient client = getTestClient(context);

            client.get().uri(properties.getJolokiaPath(false)).exchange()
                .expectStatus().isForbidden();

            client.get().uri(properties.getHawtioPath(false)).exchange()
                .expectStatus().isFound()
                .expectHeader().valueMatches("Location", loginRedirectUrlRegex);

            client.get().uri(properties.getHawtioPluginPath(false)).exchange()
                .expectStatus().isOk();

            client.get().uri(properties.getHawtioJolokiaPath(false)).exchange()
                .expectStatus().isForbidden();
        });
    }

    @Test
    public void testCustomContextPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomServletPath() {
        TestProperties properties = TestProperties.builder()
            .servletPath("/servlet-path")
            .contextPath("/context/")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .jolokiaPath("jmx/jolokia")
            .contextPath("/context-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .hawtioPath("hawtio/console")
            .contextPath("/context/")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) -> {
            ServletContextPropertySource params = context.getEnvironment().getProperty("servletConfigInitParams'", ServletContextPropertySource.class);
            assertHawtioEndpointPaths(context, properties);
        });

    }

    @Test
    public void testCustomContextAndServletPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .servletPath("/servlet-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextServletPathAndManagementBasePath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .servletPath("/servlet-path")
            .managementWebBasePath("/management-base-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextServletPathManagementBasePathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .servletPath("/servlet-path")
            .managementWebBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextServletPathManagementBasePathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .servletPath("/servlet-path")
            .managementWebBasePath("/management-base-path")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextServletPathManagementBasePathJolokiaAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .servletPath("/servlet-path")
            .managementWebBasePath("/management-base-path")
            .hawtioPath("hawtio/console")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextPathAndManagementBasePath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .managementWebBasePath("/management-base-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextPathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextPathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextPathJolokiaAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextPathServletPathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .servletPath("/servlet-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextPathServletPathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .servletPath("/servlet-path")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextPathServletPathJolokiaAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .servletPath("/servlet-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextPathManagementBasePathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .servletPath("/servlet")
            .contextPath("/context-path")
            .managementWebBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) -> {
            assertHawtioEndpointPaths(context, properties);
        });
    }

    @Test
    public void testCustomContextPathManagementBasePathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .managementWebBasePath("/management-base-path")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomContextPathManagementBasePathJolokiaAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .contextPath("/context-path")
            .managementWebBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomServletPathAndManagementBasePath() {
        TestProperties properties = TestProperties.builder()
            .servletPath("/servlet-path")
            .managementWebBasePath("/management-base-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomServletPathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .servletPath("/servlet-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) -> {
                assertHawtioEndpointPaths(context, properties);
            }
        );
    }

    @Test
    public void testCustomServletPathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .servletPath("/servlet-path")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomServletPathJolokiaAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .servletPath("/servlet-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomServletPathManagementBasePathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .servletPath("/servlet-path")
            .managementWebBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomServletPathManagementBasePathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .servletPath("/servlet-path")
            .managementWebBasePath("/management-base-path")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomServletPathManagementBasePathJolokiaAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .servletPath("/servlet-path")
            .managementWebBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomManagementBasePathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .managementWebBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomManagementBasePathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .managementWebBasePath("/management-base-path")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomManagementBasePathJolokiaAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .managementWebBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testEmptyManagementBasePath() {
        TestProperties properties = TestProperties.builder()
            .managementWebBasePath("")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }
}
