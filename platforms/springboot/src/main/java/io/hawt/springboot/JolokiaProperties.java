package io.hawt.springboot;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "management.endpoint.jolokia")
public class JolokiaProperties {
    private final Map<String, String> config = new HashMap<>();

    public Map<String, String> getConfig() {
        return this.config;
    }

}
