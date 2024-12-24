package io.hawt.quarkus;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Singleton;

import io.hawt.web.auth.Redirector;
import io.quarkus.arc.DefaultBean;
import io.quarkus.security.identity.IdentityProviderManager;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.request.AuthenticationRequest;
import io.smallrye.mutiny.Uni;

@Singleton
public class HawtioProducers {

    @Produces
    @Singleton
    public Redirector initializeRedirector() {
        Redirector redirector = new Redirector();
        redirector.setApplicationContextPath(HawtioConfig.DEFAULT_CONTEXT_PATH);
        return redirector;
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
    @ApplicationScoped
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
