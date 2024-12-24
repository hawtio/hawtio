package io.hawt.quarkus.deployment;

import java.util.Map;

import io.smallrye.config.PropertiesConfigSource;
import io.smallrye.config.SmallRyeConfigBuilder;
import io.smallrye.config.SmallRyeConfigBuilderCustomizer;

/**
 * Hawtio configuration customizer that applies necessary configurations to Quarkus
 * core and extensions to make Hawtio work properly.
 */
public class HawtioConfigCustomizer implements SmallRyeConfigBuilderCustomizer {

    @Override
    public void configBuilder(SmallRyeConfigBuilder builder) {
        Map<String, String> props = Map.of(
            // If proactive authentication is enabled, Quarkus security always intercepts
            // unauthenticated requests before they reach HawtioQuarkusAuthenticator,
            // and thus authentication throttling doesn't take effect.
            "quarkus.http.auth.proactive", "false"
        );
        builder.withSources(new PropertiesConfigSource(props, "hawtio-quarkus", 50));
    }
}
