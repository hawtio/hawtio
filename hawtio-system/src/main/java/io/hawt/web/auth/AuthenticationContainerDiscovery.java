package io.hawt.web.auth;

/**
 * <p>SPI to allow various container-specific authentication mechanisms to be integrated in Hawtio
 * authentication using JAAS.</p>
 *
 * <p>{@link #registerContainerAuthentication} is a hook method called by Hawtio on foun
 * {@link AuthenticationContainerDiscovery} and the responsibility of specific implementation is to
 * add JAAS {@link javax.security.auth.login.Configuration} using {@link AuthenticationConfiguration#addConfiguration}.
 * Hawtio will then integrate the {@link javax.security.auth.login.AppConfigurationEntry JAAS app entries}
 * with own entries, so all are used during JAAS authentication.</p>
 */
public interface AuthenticationContainerDiscovery {

    /**
     * Gets the container name such as Apache Tomcat, used for logging purpose
     */
    String getContainerName();

    /**
     * Whether the container can/should be used for authentication. If given discovery can be used,
     * {@link AuthenticationConfiguration} may be changed (for example by setting JAAS
     * {@link javax.security.auth.login.Configuration}).
     *
     * @param configuration the configuration option (mutable)
     * @return <tt>true</tt> if the container is being used for authentication.
     *
     * @deprecated use {@link #registerContainerAuthentication(AuthenticationConfiguration)}
     */
    @Deprecated
    default boolean canAuthenticate(AuthenticationConfiguration configuration) {
        return false;
    }

    /**
     * Container-specific discovery classes may perform some lookup and processing of ccontainer configuration
     * files and as a result prepare special JAAS {@link javax.security.auth.login.Configuration} to be used
     * by Hawtio during authentication. When such configuration is prepared, return {@link true}.
     *
     * @param configuration
     * @return
     */
    boolean registerContainerAuthentication(AuthenticationConfiguration configuration);

}
