package io.hawt.web.tomcat;

import java.lang.management.ManagementFactory;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;

import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.AuthenticationContainerDiscovery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To use Apache Tomcat using its conf/tomcat-users.xml for authentication.
 * <p/>
 * To use this, then the {@link AuthenticationConfiguration#getRealm()} must be empty or "*". Otherwise,
 * if an explicit configured realm has been set, then regular JAAS authentication is in use.
 */
public class TomcatAuthenticationContainerDiscovery implements AuthenticationContainerDiscovery {

    private static final Logger LOG = LoggerFactory.getLogger(TomcatAuthenticationContainerDiscovery.class);

    private static final String AUTHENTICATION_CONTAINER_TOMCAT_DIGEST_ALGORITHM = "hawtio.authenticationContainerTomcatDigestAlgorithm";
    private static final String AUTHENTICATION_TOMCAT_USER_LOCATION = "hawtio.tomcatUserFileLocation";

    @Override
    public String getContainerName() {
        return "Apache Tomcat";
    }

    @Override
    public boolean canAuthenticate(AuthenticationConfiguration configuration) {
        if (!isEmptyOrAllRealm(configuration.getRealm())) {
            LOG.debug("Realm explicit configured {}. {} userdata authentication integration not in use.", configuration.getRealm(), getContainerName());
            return false;
        }

        try {
            MBeanServer server = ManagementFactory.getPlatformMBeanServer();
            boolean isTomcat = server.isRegistered(new ObjectName("Catalina:type=Server"));
            if (!isTomcat) {
                isTomcat = server.isRegistered(new ObjectName("Tomcat:type=Server"));
            }
            LOG.debug("Checked for {} in JMX -> {}", getContainerName(), isTomcat);

            if (isTomcat) {
                configuration.setConfiguration(new TomcatLoginContextConfiguration(System.getProperty(AUTHENTICATION_CONTAINER_TOMCAT_DIGEST_ALGORITHM, "NONE").toUpperCase(),
                    System.getProperty(AUTHENTICATION_TOMCAT_USER_LOCATION,null)));
                configuration.setRolePrincipalClasses(TomcatPrincipal.class.getName());
            }
            return isTomcat;

        } catch (MalformedObjectNameException e) {
            // ignore
            LOG.warn("Error checking in JMX for " + getContainerName() + ". This exception is ignored.", e);
        }

        return false;
    }

    /**
     * Is the realm empty or * to denote any realm.
     */
    private static boolean isEmptyOrAllRealm(String realm) {
        return realm == null || realm.trim().isEmpty() || realm.trim().equals("*");
    }

}
