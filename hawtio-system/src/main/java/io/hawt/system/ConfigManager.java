package io.hawt.system;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Configuration manager that provides Hawtio configuration properties.
 */
public class ConfigManager {

    private static final Logger LOG = LoggerFactory.getLogger(ConfigManager.class);

    public static final String CONFIG_MANAGER = "ConfigManager";

    private final Function<String, String> propertyResolver;

    public ConfigManager() {
        this.propertyResolver = ConfigManager::getHawtioSystemProperty;
    }

    public ConfigManager(final Function<String, String> propertyResolver) {
        Objects.requireNonNull(propertyResolver);

        // System properties must always have priority
        this.propertyResolver = x -> getProperty(x, ConfigManager::getHawtioSystemProperty, propertyResolver);
    }

    public Optional<String> get(String name) {
        String answer = this.propertyResolver.apply(name);
        LOG.debug("Property {} is set to value {}", name, answer);
        return Optional.ofNullable(answer);
    }

    public boolean getBoolean(String name, boolean defaultValue) {
        return Boolean.parseBoolean(get(name).orElse(Boolean.toString(defaultValue)));
    }

    private static String getHawtioSystemProperty(String name) {
        return System.getProperty("hawtio." + name);
    }

    @SafeVarargs
    private static String getProperty(String name,
                                      Function<String, String>... propertyResolvers) {
        return Arrays.stream(propertyResolvers)
            .map(resolver -> resolver.apply(name))
            .filter(Objects::nonNull)
            .findFirst()
            .orElse(null);
    }

}
