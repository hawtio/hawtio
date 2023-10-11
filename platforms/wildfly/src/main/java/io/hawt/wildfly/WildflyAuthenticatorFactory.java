package io.hawt.wildfly;

import io.hawt.system.Authenticator;
import io.hawt.system.AuthenticatorFactory;
import io.hawt.system.JaasAuthenticator;
import io.hawt.web.auth.AuthenticationConfiguration;
import org.wildfly.security.auth.server.SecurityDomain;

import javax.servlet.http.HttpServletRequest;

public class WildflyAuthenticatorFactory implements AuthenticatorFactory {

    private static boolean isElytronEnabled() {
        SecurityDomain securityDomain = SecurityDomain.getCurrent();
        return securityDomain != null;
    }

    @Override
    public Authenticator createAuthenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration) {
        return isElytronEnabled()
            ? new ElytronAuthenticator(request, authConfiguration)
            : new JaasAuthenticator(request, authConfiguration);
    }

    @Override
    public Authenticator createAuthenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration, String username, String password) {
        return isElytronEnabled()
            ? new ElytronAuthenticator(request, authConfiguration, username, password)
            : new JaasAuthenticator(request, authConfiguration, username, password);
    }

}
