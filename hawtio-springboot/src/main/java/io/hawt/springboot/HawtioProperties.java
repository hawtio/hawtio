package io.hawt.springboot;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Configuration properties for hawtio
 */
public class HawtioProperties {

    private Map<String, String> properties = new HashMap<>();

    public HawtioProperties(final Map<String, String> properties) {
        this.properties = Objects.requireNonNull(properties);
    }

    public Map<String, String> get() {
        return properties;
    }
}
