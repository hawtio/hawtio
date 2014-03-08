package io.hawt.config;

/**
 * The JMX MBean interface for working with hawtio configuration
 */
public interface ConfigFacadeMBean {
    /**
     * Returns the fully qualified path name where configuration is written.
     */
    String getConfigDir();

    /**
     * Returns the hawtio version
     */
    String getVersion();

    /**
     * Whether hawtio has been configured to work in offline mode.
     */
    boolean isOffline();
}
