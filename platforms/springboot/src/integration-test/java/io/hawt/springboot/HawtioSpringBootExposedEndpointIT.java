package io.hawt.springboot;

import org.junit.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests the {@link ConditionalOnExposedEndpoint} annotation
 */
public class HawtioSpringBootExposedEndpointIT {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner().withUserConfiguration(TestConfiguration.class);

    @Test
    public void testStringListProperty() {
        contextRunner.withPropertyValues("management.endpoints.web.exposure.include=hawtio,jolokia,foo")
            .run((context) -> assertThat(context).hasBean("foo"));

        contextRunner.withPropertyValues("management.endpoints.web.exposure.include=*")
            .run((context) -> assertThat(context).hasBean("foo"));
    }

    @Test
    public void testStringArrayProperty() {
        contextRunner.withPropertyValues("management.endpoints.web.exposure.include[0]=hawtio",
            "management.endpoints.web.exposure.include[1]=jolokia", "management.endpoints.web.exposure.include[2]=foo")
            .run((context) -> assertThat(context).hasBean("foo"));

        contextRunner.withPropertyValues("management.endpoints.web.exposure.include[0]=*")
            .run((context) -> assertThat(context).hasBean("foo"));
    }

    @Test
    public void testPropertyWithoutExpectedEndpoint() {
        contextRunner.withPropertyValues("management.endpoints.web.exposure.include=hawtio,jolokia")
            .run((context) -> assertThat(context).doesNotHaveBean("foo"));
    }

    @Test
    public void testPropertyNotPresent() {
        contextRunner.run((context) -> assertThat(context).doesNotHaveBean("foo"));
    }

    @Configuration
    @ConditionalOnExposedEndpoint(name = "foo")
    static class TestConfiguration {
        @Bean
        public String foo() {
            return "foo";
        }
    }
}
