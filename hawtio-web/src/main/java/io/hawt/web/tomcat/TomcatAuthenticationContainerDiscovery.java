package io.hawt.web.tomcat;

import java.lang.management.ManagementFactory;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;

import io.hawt.web.AuthenticationConfiguration;
import io.hawt.web.AuthenticationContainerDiscovery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To use Apache Tomcat using its conf/tomcat-users.xml for authentication.
 */
public class TomcatAuthenticationContainerDiscovery implements AuthenticationContainerDiscovery {

    private static final transient Logger LOG = LoggerFactory.getLogger(TomcatAuthenticationContainerDiscovery.class);

    @Override
    public String getContainerName() {
        return "Apache Tomcat";
    }

    @Override
    public boolean canAuthenticate(AuthenticationConfiguration configuration) {
        try {
            MBeanServer server = ManagementFactory.getPlatformMBeanServer();
            boolean isTomcat = server.isRegistered(new ObjectName("Catalina:type=Server"));
            if (!isTomcat) {
                isTomcat = server.isRegistered(new ObjectName("Tomcat:type=Server"));
            }
            LOG.debug("Checked for {} in JMX for {} -> {}", getContainerName(), isTomcat);

            if (isTomcat) {
                configuration.setConfiguration(new TomcatLoginContextConfiguration());
                configuration.setRolePrincipalClasses(TomcatPrincipal.class.getName());
            }
            return isTomcat;

        } catch (MalformedObjectNameException e) {
            // ignore
            LOG.warn("Error checking in JMX for " + getContainerName() + ". This exception is ignored.", e);
        }

        return false;
    }

}
