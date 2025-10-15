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
 * <p>To use Apache Tomcat using its {@code conf/tomcat-users.xml} for authentication.</p>
 *
 * <p>To use this, then the {@link AuthenticationConfiguration#getRealm()} must be empty or "*". Otherwise,
 * if an explicit configured realm has been set, then regular JAAS authentication is in use.</p>
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
    public boolean registerContainerAuthentication(AuthenticationConfiguration configuration) {
        try {
            MBeanServer server = ManagementFactory.getPlatformMBeanServer();
            boolean isTomcat = server.isRegistered(new ObjectName("Catalina:type=Server"));
            if (!isTomcat) {
                isTomcat = server.isRegistered(new ObjectName("Tomcat:type=Server"));
            }
            LOG.debug("Checked for {} in JMX -> {}", getContainerName(), isTomcat);

            if (isTomcat) {
                // https://tomcat.apache.org/tomcat-11.0-doc/realm-howto.html#Digested_Passwords
                // org.apache.catalina.realm.MessageDigestCredentialHandler.matches()
                String digestAlgorithm = System.getProperty(AUTHENTICATION_CONTAINER_TOMCAT_DIGEST_ALGORITHM, "NONE").toUpperCase();
                // location of tomcat-users.xml file - defaults to ${catalina.base}/conf/tomcat-users.xml
                String tomcatUsersLocation = System.getProperty(AUTHENTICATION_TOMCAT_USER_LOCATION, null);

                configuration.addConfiguration(new TomcatLoginContextConfiguration(digestAlgorithm, tomcatUsersLocation));
                configuration.addRolePrincipalClassName(TomcatPrincipal.class.getName());
            }
            return isTomcat;

        } catch (MalformedObjectNameException e) {
            // ignore
            LOG.warn("Error checking in JMX for {}", getContainerName() + ". This exception is ignored.", e);
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
