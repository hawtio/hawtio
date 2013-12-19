package io.hawt.web.tomcat;

import io.hawt.web.AuthenticationConfiguration;
import io.hawt.web.AuthenticationContainerDiscovery;

/**
 * To use Apache Tomcat using its conf/tomcat-users.xml for authentication.
 */
public class TomcatAuthenticationContainerDiscovery implements AuthenticationContainerDiscovery {

    @Override
    public String getContainerName() {
        return "Apache Tomcat";
    }

    @Override
    public boolean canAuthenticate(AuthenticationConfiguration configuration) {
        // TODO: are we running in Tomcat
        // lookup in JMX or env check?

        boolean isTomcat = true;
        if (isTomcat) {
            configuration.setConfiguration(new TomcatLoginContextConfiguration());
            configuration.setRolePrincipalClasses(TomcatPrincipal.class.getName());
        }

        return isTomcat;
    }
}
