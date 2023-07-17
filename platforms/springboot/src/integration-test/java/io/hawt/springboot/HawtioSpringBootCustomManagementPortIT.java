package io.hawt.springboot;

import org.junit.Before;
import org.junit.Test;

public class HawtioSpringBootCustomManagementPortIT extends HawtioSpringBootTestCommon {

    @Before
    public void setUp() {
        super.setUp();
        contextRunner = contextRunner.withPropertyValues("management.server.port=" + MANAGEMENT_PORT);
        this.isCustomManagementPortConfigured = true;
    }

    @Test
    public void testCustomManagementBasePath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) -> {
            assertHawtioEndpointPaths(context, properties, true);
        });
    }

    @Test
    public void testCustomManagementBasePathAndManagementWebBasePath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .managementWebBasePath("/management-base-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testCustomManagementBasePathManagementWebBasePathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .managementWebBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testCustomManagementBasePathManagementWebBasePathJolokiaPathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .managementWebBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testCustomManagementBasePathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testCustomManagementBasePathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testCustomManagementBasePathJolokiaPathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testMultipleManagementBasePath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management/context/path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }
}
