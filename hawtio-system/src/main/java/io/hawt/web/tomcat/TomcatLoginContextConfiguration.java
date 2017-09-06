package io.hawt.web.tomcat;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import javax.security.auth.login.AppConfigurationEntry;
import javax.security.auth.login.Configuration;

/**
 * Configuration class to avoid having to deal with jaas.config files in the classpath
 */
public class TomcatLoginContextConfiguration extends Configuration {

    private final AppConfigurationEntry entry;

    public TomcatLoginContextConfiguration(final String digestAlgorithm, final String tomcatUserLocation) {
        Map<String, Object> options = new HashMap<>(1);
        options.put(TomcatUserDatabaseLoginContext.OPTION_DIGEST_ALGORITHM, digestAlgorithm);
        options.put(TomcatUserDatabaseLoginContext.OPTION_TOMCAT_USER_LOCATION, tomcatUserLocation);
        this.entry = new TomcatAppConfigurationEntry(Collections.unmodifiableMap(options));
    }

    @Override
    public AppConfigurationEntry[] getAppConfigurationEntry(String name) {
        return new AppConfigurationEntry[]{entry};
    }

    private static final class TomcatAppConfigurationEntry extends AppConfigurationEntry {
        public TomcatAppConfigurationEntry(Map<String, Object> options) {
            super("io.hawt.web.tomcat.TomcatUserDatabaseLoginContext", LoginModuleControlFlag.REQUIRED, options);
        }
    }

}
