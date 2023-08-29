package io.hawt.quarkus;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import io.quarkus.runtime.annotations.ConfigGroup;
import io.quarkus.runtime.annotations.ConfigItem;
import io.quarkus.runtime.annotations.ConfigPhase;
import io.quarkus.runtime.annotations.ConfigRoot;

@ConfigRoot(name = "hawtio", phase = ConfigPhase.BUILD_AND_RUN_TIME_FIXED)
public class HawtioConfig {

    public static final String DEFAULT_CONTEXT_PATH = "/hawtio";
    public static final String DEFAULT_PLUGIN_PATH = DEFAULT_CONTEXT_PATH + "/plugin";

    /**
     * Enables or disables Hawtio authentication
     */
    @ConfigItem(name = "authenticationEnabled", defaultValue = "true")
    public Boolean authenticationEnabled;

    /**
     * The user role required to log in to the console
     */
    @ConfigItem
    public Optional<String> role;

    /**
     * Comma separated list of user roles required to log in to the console
     */
    @ConfigItem
    public Optional<List<String>> roles;

    /**
     * Enables or disables Hawtio keycloak support
     */
    @ConfigItem(name = "keycloakEnabled", defaultValue = "false")
    public Boolean keycloakEnabled;

    /**
     * The location of client-side configuration file for Hawtio Keycloak support
     */
    @ConfigItem(name = "keycloakClientConfig")
    public Optional<String> keycloakClientConfig;

    /**
     * The maximum time interval, in seconds, that the servlet container will keep this session open between client accesses
     */
    @ConfigItem(name = "sessionTimeout", defaultValue = "1800")
    public Optional<Integer> sessionTimeout;

    /**
     * Comma separated list for target hosts that the hawtio-jmx Connect plugin can connect to via ProxyServlet.
     * <p>
     * All hosts that are not listed in this allowlist are denied to connect for security reasons. This option can be set to * to restore the old behavior and
     * allow all hosts. Prefixing an element of the list with "r:" allows you to define a regexp (example: localhost,r:myservers[0-9]+.mydomain.com)
     */
    @ConfigItem(name = "proxyAllowlist", defaultValue = "localhost, 127.0.0.1")
    public Optional<List<String>> proxyAllowlist;

    /**
     * Whether local address probing for proxy allowlist is enabled or not upon startup. Set this property to false to disable it
     */
    @ConfigItem(name = "localAddressProbing", defaultValue = "true")
    public Boolean localAddressProbing;

    /**
     * Enable or disable the Hawtio proxy servlet.
     * By default, it's disabled to hide Connect plugin when embedded in Quarkus.
     */
    @ConfigItem(name = "disableProxy", defaultValue = "true")
    public Boolean disableProxy;

    /**
     * Map of custom Hawtio plugin configurations
     */
    @ConfigItem(name = "plugin")
    public Map<String, PluginConfig> pluginConfigs;

    @ConfigGroup
    public static class PluginConfig {
        /**
         * URL of the remote plugin.
         */
        @ConfigItem
        public Optional<String> url;
        /**
         * Scope of the remote plugin.
         */
        @ConfigItem
        public String scope;
        /**
         * Module path of the remote plugin.
         */
        @ConfigItem
        public String module;
        /**
         * (Optional) Custom remote entry file name of the remote plugin.
         * Defaults to <code>remoteEntry.js</code>.
         */
        @ConfigItem(name = "remoteEntryFileName")
        public Optional<String> remoteEntryFileName;
        /**
         * (Optional) Whether to bust remote entry cache of the remote plugin.
         * Defaults to <code>false</code>.
         */
        @ConfigItem(name = "bustRemoteEntryCache")
        public Optional<Boolean> bustRemoteEntryCache;
        /**
         * (Optional) Hawtio plugin entry name of the remote plugin.
         * Defaults to <code>plugin</code>.
         */
        @ConfigItem(name = "pluginEntry")
        public Optional<String> pluginEntry;
    }
}
