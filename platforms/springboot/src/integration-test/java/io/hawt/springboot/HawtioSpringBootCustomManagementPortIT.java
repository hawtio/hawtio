package io.hawt.springboot;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assumptions.assumeFalse;

public class HawtioSpringBootCustomManagementPortIT extends HawtioSpringBootTestCommon {

    @BeforeAll
    public static void isNotMacAndCI() {
        // TODO: The tests are flaky on Mac runners in CI. We should find the root cause and fix it.
        boolean mac = System.getProperty("os.name").toLowerCase().contains("mac");
        boolean ci = System.getenv("CI") != null;
        assumeFalse(mac && ci, "Skipping as the tests are flaky on Mac runners in CI");
    }

    @BeforeEach
    public void setUp() {
        super.setUp();
        contextRunner = contextRunner.withPropertyValues("management.server.port=" + MANAGEMENT_PORT);
        this.isCustomManagementPortConfigured = true;
    }

    @Test
    public void testCustomManagementContextPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) -> assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testCustomManagementContextPathAndManagementBasePath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .managementWebBasePath("/management-base-path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testCustomManagementContextPathManagementBasePathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .managementWebBasePath("/management-base-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testCustomManagementContextPathManagementBasePathJolokiaPathAndHawtioPath() {
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
    public void testCustomManagementContextPathAndJolokiaPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .jolokiaPath("jmx/jolokia")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testCustomManagementContextPathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testCustomManagementContextPathJolokiaPathAndHawtioPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management-context-path")
            .jolokiaPath("jmx/jolokia")
            .hawtioPath("hawtio/console")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }

    @Test
    public void testMultipleManagementContextPath() {
        TestProperties properties = TestProperties.builder()
            .managementBasePath("/management/context/path")
            .build();
        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            assertHawtioEndpointPaths(context, properties, true));
    }
}
