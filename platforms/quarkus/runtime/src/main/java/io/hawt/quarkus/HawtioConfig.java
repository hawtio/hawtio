package io.hawt.quarkus;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import io.quarkus.runtime.annotations.ConfigGroup;
import io.quarkus.runtime.annotations.ConfigPhase;
import io.quarkus.runtime.annotations.ConfigRoot;
import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;
import io.smallrye.config.WithName;

@ConfigMapping(prefix = "quarkus.hawtio", namingStrategy = ConfigMapping.NamingStrategy.VERBATIM)
@ConfigRoot(phase = ConfigPhase.BUILD_AND_RUN_TIME_FIXED)
public interface HawtioConfig {

    String DEFAULT_CONTEXT_PATH = "/hawtio";
    String DEFAULT_PLUGIN_PATH = DEFAULT_CONTEXT_PATH + "/plugin";

    /**
     * Enables or disables Hawtio authentication
     */
    @WithDefault("true")
    Boolean authenticationEnabled();

    /**
     * Throttles authentication to protect Hawtio from brute force attacks.
     */
    @WithDefault("true")
    Boolean authenticationThrottled();

    /**
     * Comma separated list of user roles required to log in to the console
     */
    Optional<List<String>> roles();

    /**
     * Enables or disables Hawtio keycloak support
     */
    @WithDefault("false")
    Boolean keycloakEnabled();

    /**
     * The location of client-side configuration file for Hawtio Keycloak support
     */
    Optional<String> keycloakClientConfig();

    /**
     * The maximum time interval, in seconds, that the servlet container will keep this session open between client accesses
     */
    @WithDefault("1800")
    Optional<Integer> sessionTimeout();

    /**
     * Comma separated list for target hosts that the hawtio-jmx Connect plugin can connect to via ProxyServlet.
     * <p>
     * All hosts that are not listed in this allowlist are denied to connect for security reasons. This option can be set to * to restore the old behavior and
     * allow all hosts. Prefixing an element of the list with "r:" allows you to define a regexp (example: localhost,r:myservers[0-9]+.mydomain.com)
     */
    @WithDefault("localhost, 127.0.0.1")
    Optional<List<String>> proxyAllowlist();

    /**
     * Whether local address probing for proxy allowlist is enabled or not upon startup. Set this property to false to disable it
     */
    @WithDefault("true")
    Boolean localAddressProbing();

    /**
     * Enable or disable the Hawtio proxy servlet.
     * By default, it's disabled to hide Connect plugin when embedded in Quarkus.
     */
    @WithDefault("true")
    Boolean disableProxy();

    /**
     * Map of custom Hawtio plugin configurations
     */
    @WithName("plugin")
    Map<String, PluginConfig> pluginConfigs();

    @ConfigGroup
    interface PluginConfig {
        /**
         * URL of the remote plugin.
         */
        Optional<String> url();

        /**
         * Scope of the remote plugin.
         */
        String scope();

        /**
         * Module path of the remote plugin.
         */
        String module();

        /**
         * (Optional) Custom remote entry file name of the remote plugin.
         * Defaults to <code>remoteEntry.js</code>.
         */
        Optional<String> remoteEntryFileName();

        /**
         * (Optional) Whether to bust remote entry cache of the remote plugin.
         * Defaults to <code>false</code>.
         */
        Optional<Boolean> bustRemoteEntryCache();

        /**
         * (Optional) Hawtio plugin entry name of the remote plugin.
         * Defaults to <code>plugin</code>.
         */
        Optional<String> pluginEntry();
    }
}
