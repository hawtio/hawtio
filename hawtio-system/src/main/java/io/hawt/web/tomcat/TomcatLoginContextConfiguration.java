package io.hawt.web.tomcat;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import javax.security.auth.login.AppConfigurationEntry;
import javax.security.auth.login.Configuration;

/**
 * {@link Configuration} class declaring a {@link javax.security.auth.spi.LoginModule} that authenticates
 * users based on Tomcat specific {@code conf/tomcat-users.xml} file.<br />
 * This is a dynamic JAAS {@link Configuration} which doesn't require setting
 * {@code -Djava.security.auth.login.config}.
 */
public class TomcatLoginContextConfiguration extends Configuration {

    private final AppConfigurationEntry entry;

    public TomcatLoginContextConfiguration(final String digestAlgorithm, final String tomcatUserLocation) {
        Map<String, Object> options = new HashMap<>();
        options.put(TomcatUsersLoginModule.OPTION_DIGEST_ALGORITHM, digestAlgorithm);
        options.put(TomcatUsersLoginModule.OPTION_TOMCAT_USER_LOCATION, tomcatUserLocation);
        options.put(TomcatUsersLoginModule.OPTION_TOMCAT_SUPPORT, new TomcatSupport(digestAlgorithm, tomcatUserLocation));

        // the flag is REQUIRED, but this login module returns false if user is not found.
        // This allows multi-authentication in Hawtio
        this.entry = new AppConfigurationEntry(TomcatUsersLoginModule.class.getName(),
                AppConfigurationEntry.LoginModuleControlFlag.REQUIRED, Collections.unmodifiableMap(options));
    }

    @Override
    public AppConfigurationEntry[] getAppConfigurationEntry(String name) {
        return new AppConfigurationEntry[] { entry };
    }

}
