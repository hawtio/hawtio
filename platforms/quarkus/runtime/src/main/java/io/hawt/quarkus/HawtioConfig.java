package io.hawt.quarkus;

import io.quarkus.runtime.annotations.ConfigGroup;
import io.quarkus.runtime.annotations.ConfigItem;
import io.quarkus.runtime.annotations.ConfigPhase;
import io.quarkus.runtime.annotations.ConfigRoot;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@ConfigRoot(name = "hawtio", phase = ConfigPhase.BUILD_AND_RUN_TIME_FIXED)
public class HawtioConfig {

    public static final String DEFAULT_CONTEXT_PATH = "/hawtio";
    public static final String DEFAULT_PLUGIN_CONTEXT_PATH = DEFAULT_CONTEXT_PATH + "/plugin";

    /**
     * Enables or disables Hawtio authentication
     */
    @ConfigItem(name="authenticationEnabled", defaultValue = "true")
    public Boolean authenticationEnabled;

    /**
     * The user role required to login to the console
     */
    @ConfigItem
    public Optional<String> role;

    /**
     * Comma separated list of user roles required to login to the console
     */
    @ConfigItem
    public Optional<List<String>> roles;

    /**
     * The maximum time interval, in seconds, that the servlet container will keep this session open between client accesses
     */
    @ConfigItem(name = "sessionTimeout", defaultValue = "1800")
    public Optional<Integer> sessionTimeout;

    /**
     * Comma separated list for target hosts that the hawtio-jmx Connect plugin can connect to via ProxyServlet.
     *
     * All hosts that are not listed in this allowlist are denied to connect for security reasons. This option can be set to * to restore the old behavior and
     * allow all hosts. Prefixing an element of the list with "r:" allows you to define a regexp (example: localhost,r:myservers[0-9]+.mydomain.com)
     */
    @ConfigItem(name = "proxyAllowList", defaultValue = "localhost, 127.0.0.1")
    public Optional<List<String>> proxyAllowList;

    /**
     * Whether local address probing for proxy allowlist is enabled or not upon startup. Set this property to false to disable it
     */
    @ConfigItem(name = "localAddressProbing", defaultValue = "true")
    public Boolean localAddressProbing;

    /**
     * Enable or disable the Hawtio proxy servlet
     */
    @ConfigItem(name = "disableProxy", defaultValue = "false")
    public Boolean disableProxy;

    /**
     * Map of custom Hawtio plugin configurations
     */
    @ConfigItem(name = ConfigItem.PARENT)
    public Map<String, HawtioPluginConfig> pluginConfigs;

    @ConfigGroup
    public static class HawtioPluginConfig {
        /**
         * Comma separated list of scripts that comprise any custom Hawtio plugins included within the application
         */
        @ConfigItem
        public Optional<List<String>> scriptPaths;
    }
}
