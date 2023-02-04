package io.hawt.springboot;

import org.junit.Before;
import org.junit.Test;

public class HawtioSpringBootCustomManagementPortIT extends HawtioSpringBootTestCommon {

    @Before
    public void setUp() {
        super.setUp();
        contextRunner = contextRunner.withPropertyValues("management.server.port=" + MANAGEMENT_PORT);
    }

    @Test
    public void testCustomManagementContextPath() {
        TestProperties properties = TestProperties.builder()
            .managementContextPath("/management-context-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomManagementContextPathAndManagementBasePath() {
        TestProperties properties = TestProperties.builder()
            .managementContextPath("/management-context-path")
            .managementBasePath("/management-base-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomManagementContextPathManagementBasePathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .managementContextPath("/management-context-path")
            .managementBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomManagementContextPathManagementBasePathJolokiaPathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .managementContextPath("/management-context-path")
            .managementBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomManagementContextPathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .managementContextPath("/management-context-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomManagementContextPathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .managementContextPath("/management-context-path")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testCustomManagementContextPathJolokiaPathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .managementContextPath("/management-context-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testEmptyManagementContextPath() {
        TestProperties properties = TestProperties.builder()
            .managementContextPath("")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testRootManagementContextPath() {
        TestProperties properties = TestProperties.builder()
            .managementContextPath("/")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }

    @Test
    public void testMultipleManagementContextPath() {
        TestProperties properties = TestProperties.builder()
            .managementContextPath("/management/context/path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties));
    }
}
