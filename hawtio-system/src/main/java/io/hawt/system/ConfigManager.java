package io.hawt.system;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Configuration manager that provides hawtio configuration properties.
 */
public class ConfigManager {

    private static final Logger LOG = LoggerFactory.getLogger(ConfigManager.class);

    /**
     * Hawtio system property:
     * Boolean flag indicating whether JNDI configuration should be skipped in
     * preference of system properties.
     */
    public static final String FORCE_PROPERTIES = "forceProperties";

    public static final String CONFIG_MANAGER = "ConfigManager";

    private Context envContext = null;

    private final Function<String, String> propertyResolver;

    public ConfigManager() {
        this.propertyResolver = ConfigManager::getHawtioSystemProperty;
    }

    public ConfigManager(final Function<String, String> propertyResolver) {
        Objects.requireNonNull(propertyResolver);

        // System properties must always have priority
        this.propertyResolver = x -> getProperty(x, ConfigManager::getHawtioSystemProperty, propertyResolver);
    }

    public void init() {
        if (Boolean.parseBoolean(getHawtioSystemProperty(FORCE_PROPERTIES))) {
            LOG.info("Forced using system properties");
            return;
        }

        try {
            envContext = (Context) new InitialContext().lookup("java:comp/env");
            LOG.info("Configuration will be discovered via JNDI");
        } catch (NamingException e) {
            LOG.debug("Failed to look up environment context: {}", e.getMessage());
            LOG.info("Configuration will be discovered via system properties");
        }
    }

    public void destroy() {
        if (envContext != null) {
            try {
                envContext.close();
            } catch (NamingException e) {
                // ignore...
            }
            envContext = null;
        }
    }

    public Optional<String> get(String name) {
        String answer = null;
        if (envContext != null) {
            try {
                answer = (String) envContext.lookup("hawtio/" + name);
            } catch (Exception e) {
                // ignore...
            }
        }

        if (answer == null) {
            answer = this.propertyResolver.apply(name);
        }

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
