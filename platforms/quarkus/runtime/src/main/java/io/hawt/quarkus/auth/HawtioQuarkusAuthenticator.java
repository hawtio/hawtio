package io.hawt.quarkus.auth;

import java.util.List;
import java.util.Optional;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import io.hawt.system.AuthenticateResult;
import io.hawt.util.Strings;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.AuthenticationThrottler;
import io.quarkus.security.AuthenticationFailedException;
import io.quarkus.security.credential.PasswordCredential;
import io.quarkus.security.identity.IdentityProviderManager;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.request.UsernamePasswordAuthenticationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Hawtio authenticator for Quarkus.
 */
@ApplicationScoped
public class HawtioQuarkusAuthenticator {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioQuarkusAuthenticator.class);

    @Inject
    IdentityProviderManager identityProviderManager;

    public AuthenticateResult authenticate(AuthenticationConfiguration authConfiguration,
                                           String username, String password) {
        LOG.debug("Authenticate user: {}", username);

        if (Strings.isBlank(username) || Strings.isBlank(password)) {
            return AuthenticateResult.noCredentials();
        }

        // Try throttling authentication request when necessary
        Optional<AuthenticationThrottler> throttler = authConfiguration.getThrottler();
        AuthenticationThrottler.Attempt attempt = throttler
            .map(t -> t.attempt(username))
            .filter(AuthenticationThrottler.Attempt::isBlocked)
            .orElse(null);
        if (attempt != null) {
            LOG.debug("Authentication throttled: {}", attempt);
            return AuthenticateResult.throttled(attempt.retryAfter());
        }

        PasswordCredential credential = new PasswordCredential(password.toCharArray());
        UsernamePasswordAuthenticationRequest authRequest = new UsernamePasswordAuthenticationRequest(username, credential);

        try {
            SecurityIdentity identity = identityProviderManager.authenticateBlocking(authRequest);
            List<String> roleConfig = authConfiguration.getRoles();
            // Verify the allowed roles matches with those specified in Quarkus security config
            if (!verifyRole(identity, roleConfig)) {
                return AuthenticateResult.notAuthorized();
            }
            throttler.ifPresent(t -> t.reset(username));
            return AuthenticateResult.authorized();
        } catch (AuthenticationFailedException e) {
            LOG.warn("Login failed due to: {}", e.getMessage());
            throttler.ifPresent(t -> t.increase(username));
            return AuthenticateResult.notAuthorized();
        }

    }

    private static boolean verifyRole(SecurityIdentity identity, List<String> roleConfig) {
        if (roleConfig.isEmpty() || roleConfig.contains("*")) {
            return true;
        }

        return roleConfig.stream().anyMatch(identity.getRoles()::contains);
    }
}
