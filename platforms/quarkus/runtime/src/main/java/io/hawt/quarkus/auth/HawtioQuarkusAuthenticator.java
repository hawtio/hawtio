package io.hawt.quarkus.auth;

import java.util.Arrays;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;

import io.hawt.system.AuthenticateResult;
import io.hawt.util.Strings;
import io.hawt.web.auth.AuthSessionHelpers;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.quarkus.security.AuthenticationFailedException;
import io.quarkus.security.credential.PasswordCredential;
import io.quarkus.security.identity.IdentityProviderManager;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.request.UsernamePasswordAuthenticationRequest;

/**
 * Hawtio authenticator for Quarkus.
 */
@ApplicationScoped
public class HawtioQuarkusAuthenticator {

    @Inject
    private IdentityProviderManager identityProviderManager;

    public AuthenticateResult authenticate(HttpServletRequest request, AuthenticationConfiguration authConfiguration, String username, String password) {
        if (Strings.isBlank(username) || Strings.isBlank(password)) {
            return AuthenticateResult.NO_CREDENTIALS;
        }

        PasswordCredential credential = new PasswordCredential(password.toCharArray());
        UsernamePasswordAuthenticationRequest authRequest = new UsernamePasswordAuthenticationRequest(username, credential);

        try {
            SecurityIdentity identity = identityProviderManager.authenticateBlocking(authRequest);
            String roleConfig = authConfiguration.getRole();
            // Verify the allowed roles matches with those specified in Quarkus security config
            if (!verifyRole(identity, roleConfig)) {
                return AuthenticateResult.NOT_AUTHORIZED;
            }
            return AuthenticateResult.AUTHORIZED;
        } catch (
            AuthenticationFailedException e) {
            return AuthenticateResult.NOT_AUTHORIZED;
        }

    }

    private static boolean verifyRole(SecurityIdentity identity, String roleConfig) {
        if (Strings.isBlank(roleConfig) || roleConfig.equals("*")) {
            return true;
        }

        String[] roles = roleConfig.split(",");
        return Arrays.stream(roles).anyMatch(identity.getRoles()::contains);
    }
}
