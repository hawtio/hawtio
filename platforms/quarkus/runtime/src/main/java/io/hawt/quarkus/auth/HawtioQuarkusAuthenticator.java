package io.hawt.quarkus.auth;

import java.util.Arrays;
import java.util.Optional;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;

import io.hawt.system.AuthenticateResult;
import io.hawt.util.Strings;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.AuthenticationThrottler;
import io.quarkus.arc.DefaultBean;
import io.quarkus.security.AuthenticationFailedException;
import io.quarkus.security.credential.PasswordCredential;
import io.quarkus.security.identity.IdentityProviderManager;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.request.AuthenticationRequest;
import io.quarkus.security.identity.request.UsernamePasswordAuthenticationRequest;
import io.smallrye.mutiny.Uni;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Hawtio authenticator for Quarkus.
 */
@ApplicationScoped
public class HawtioQuarkusAuthenticator {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioQuarkusAuthenticator.class);

    @Inject
    private IdentityProviderManager identityProviderManager;

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
            String roleConfig = authConfiguration.getRoles();
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

    private static boolean verifyRole(SecurityIdentity identity, String roleConfig) {
        if (Strings.isBlank(roleConfig) || roleConfig.equals("*")) {
            return true;
        }

        String[] roles = roleConfig.split(",");
        return Arrays.stream(roles).anyMatch(identity.getRoles()::contains);
    }

    /**
     * Default no-op identity provider manager.
     * <p>
     * It is used only when Hawtio authentication is disabled, but should never
     * be invoked from anywhere at runtime.
     * <p>
     * When Hawtio authentication is enabled a security capability is required,
     * so the user will need to provide a proper identity provider manager other
     * than this no-op one to boot the application.
     */
    @Produces
    @DefaultBean
    public IdentityProviderManager noopIdentityProviderManager() {
        return new IdentityProviderManager() {
            @Override
            public Uni<SecurityIdentity> authenticate(AuthenticationRequest request) {
                return null;
            }

            @Override
            public SecurityIdentity authenticateBlocking(AuthenticationRequest request) {
                return null;
            }
        };
    }
}
