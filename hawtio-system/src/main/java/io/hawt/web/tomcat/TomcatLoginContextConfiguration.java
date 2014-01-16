package io.hawt.web.tomcat;

import java.util.HashMap;
import javax.security.auth.login.AppConfigurationEntry;
import javax.security.auth.login.Configuration;

/**
 * Configuration class to avoid having to deal with jaas.config files in the classpath
 */
public class TomcatLoginContextConfiguration extends Configuration {

    private final AppConfigurationEntry entry = new TomcatAppConfigurationEntry();

    @Override
    public AppConfigurationEntry[] getAppConfigurationEntry(String name) {
        return new AppConfigurationEntry[]{entry};
    }

    private static final class TomcatAppConfigurationEntry extends AppConfigurationEntry {
        public TomcatAppConfigurationEntry() {
            super("io.hawt.web.tomcat.TomcatUserDatabaseLoginContext", LoginModuleControlFlag.REQUIRED, new HashMap<String, Object>());
        }
    }

}
