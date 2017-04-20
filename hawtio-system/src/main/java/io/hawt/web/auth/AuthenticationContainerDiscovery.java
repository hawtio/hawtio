package io.hawt.web.auth;

/**
 * SPI to allow various containers to discover and hook up needed configuration
 * changes to {@link AuthenticationConfiguration} so hawtio {@link AuthenticationFilter}
 * can integrate with the container easily.
 */
public interface AuthenticationContainerDiscovery {

    /**
     * Gets the container name such as Apache Tomcat, used for logging purpose
     */
    String getContainerName();

    /**
     * Whether the container can/should be used for authentication
     *
     * @param configuration the configuration option (muteable)
     * @return <tt>true</tt> if the container is being used for authentication.
     */
    boolean canAuthenticate(AuthenticationConfiguration configuration);

}
