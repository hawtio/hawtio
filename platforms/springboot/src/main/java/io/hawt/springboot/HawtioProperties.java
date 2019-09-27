package io.hawt.springboot;

import java.util.Map;
import java.util.Objects;

/**
 * Configuration properties for Hawtio
 */
public class HawtioProperties {

    private final Map<String, String> properties;

    public HawtioProperties(final Map<String, String> properties) {
        this.properties = Objects.requireNonNull(properties);
    }

    public Map<String, String> get() {
        return properties;
    }
}
