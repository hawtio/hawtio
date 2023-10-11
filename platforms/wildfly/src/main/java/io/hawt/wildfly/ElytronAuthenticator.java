package io.hawt.wildfly;

import io.hawt.system.AbstractAuthenticator;
import io.hawt.util.Strings;
import io.hawt.web.auth.AuthenticationConfiguration;
import org.jboss.as.webservices.util.SubjectUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wildfly.security.auth.server.RealmUnavailableException;
import org.wildfly.security.auth.server.SecurityDomain;
import org.wildfly.security.auth.server.SecurityIdentity;
import org.wildfly.security.evidence.Evidence;
import org.wildfly.security.evidence.PasswordGuessEvidence;
import org.wildfly.security.evidence.X509PeerCertificateChainEvidence;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Authenticator performs authentication using Elytron security system on EAP/Wildfly
 *
 * Authenticator supports the following authentication methods:
 * <ul>
 * <li>a set of user name and password</li>
 * <li>client certificates</li>
 * </ul>
 */
public class ElytronAuthenticator extends AbstractAuthenticator {

    private static final Logger LOG = LoggerFactory.getLogger(ElytronAuthenticator.class);


    public ElytronAuthenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration, String username, String password) {
        super(LOG, request, authConfiguration, username, password);
    }

    public ElytronAuthenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration) {
        super(LOG, request, authConfiguration);
    }


    @Override
    protected Subject doAuthenticate() {
        String role = authConfiguration.getRole();

        try {
            LOG.debug("Elytron doAuthenticate[role={}, username={}, password={}]",
                role, username, "******");

            SecurityDomain securityDomain = SecurityDomain.getCurrent();
            Evidence evidence = createAuthenticationEvidence();
            SecurityIdentity securityIdentity = securityDomain.authenticate(username, evidence);
            if (checkRoles(securityIdentity, role)) {
                Subject subject = initSubject();
                return SubjectUtil.fromSecurityIdentity(securityIdentity, subject);
            }
        } catch (RealmUnavailableException ex) {
            LOG.warn("Realm not available", ex);
        }
        return null;
    }

    @Override
    public void logout(AuthenticationConfiguration authConfiguration, Subject subject) {
        // the SecurityIdentity hasn't been stored in any context, no need to log out
    }

    private Evidence createAuthenticationEvidence() {
        return isUsernamePasswordSet()
            ? new PasswordGuessEvidence(password.toCharArray())
            : new X509PeerCertificateChainEvidence(certificates);
    }

    private boolean checkRoles(SecurityIdentity securityIdentity, String roles) {
        if (Strings.isBlank(roles)) {
            LOG.debug("Skipping role check, no role configured");
            return true;
        }
        if (roles.equals("*")) {
            LOG.debug("Skipping role check, all roles allowed");
            return true;
        }
        Set<String> roleSet = new HashSet<>(Arrays.asList(roles.split(",")));
        boolean found = securityIdentity.getRoles().containsAny(roleSet);
        if (!found) {
            LOG.debug("User {} does not have the required role {}", username, roles);
        }
        return found;
    }

}
