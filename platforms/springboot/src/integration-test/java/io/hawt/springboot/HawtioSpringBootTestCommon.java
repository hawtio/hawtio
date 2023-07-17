package io.hawt.springboot;

import org.junit.Test;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.assertj.core.api.Assertions.assertThat;

public abstract class HawtioSpringBootTestCommon extends HawtioSpringBootTestSupport {

    @Test
    public void testHawtioEndpointNotExposed() {
        TestProperties properties = TestProperties.builder()
            .hawtioExposed(false)
            .build();

        getContextRunner().withPropertyValues(properties.getProperties()).run((context) ->
            getTestClient(context).get().uri(properties.getHawtioPath(false)).exchange().expectStatus().isNotFound());
    }

    @Test
    public void testHawtioEndpointDisabled() {
        TestProperties properties = TestProperties.builder()
            .hawtioEnabled(false)
            .build();

        getContextRunner().withPropertyValues(properties.getProperties()).run((context) -> {
            assertThat(context.containsBean("hawtioEndpoint")).isFalse();
            assertThat(context.containsBean("hawtioManagementConfiguration")).isFalse();

            getTestClient(context).get().uri(properties.getHawtioPath(false)).exchange()
                .expectStatus().isNotFound();
        });
    }

    @Test
    public void testJolokiaEndpointDisabled() {
        TestProperties properties = TestProperties.builder()
            .jolokiaEnabled(false)
            .build();

        getContextRunner().withPropertyValues(properties.getProperties()).run((context) -> {
            WebTestClient client = getTestClient(context);

            client.get().uri(properties.getJolokiaPath(false)).exchange()
                .expectStatus().isNotFound();

            client.get().uri(properties.getJolokiaPath(false) + "/foo/bar?a=b").exchange()
                .expectStatus().isNotFound();

            client.get().uri(properties.getHawtioJolokiaPath(false)).exchange()
                .expectStatus().isNotFound();

            client.get().uri(properties.getHawtioJolokiaPath(false) + "/foo/bar?a=b").exchange()
                .expectStatus().isNotFound();
        });
    }
}
