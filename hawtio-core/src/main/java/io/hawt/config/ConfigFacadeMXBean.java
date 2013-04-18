package io.hawt.config;

/**
 * The JMX MBean interface for working with hawtio configuration
 */
public interface ConfigFacadeMXBean {
    /**
     * Returns the fully qualified path name where configuration is written.
     */
    String getConfigDir();

    /**
     * Returns the hawtio version
     */
    String getVersion();
}
