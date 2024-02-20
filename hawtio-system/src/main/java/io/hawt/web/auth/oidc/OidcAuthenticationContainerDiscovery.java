package io.hawt.web.auth.oidc;

import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.AuthenticationContainerDiscovery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * When valid, enabled OIDC configuration is found, we can configure JAAS without using external {@code login.conf} file.
 */
public class OidcAuthenticationContainerDiscovery implements AuthenticationContainerDiscovery {

    private static final Logger LOG = LoggerFactory.getLogger(OidcAuthenticationContainerDiscovery.class);

    @Override
    public String getContainerName() {
        return "OpenID Connect enabled container";
    }

    @Override
    public boolean canAuthenticate(AuthenticationConfiguration configuration) {
        if (configuration.getOidcConfiguration() == null || !configuration.getOidcConfiguration().isEnabled()) {
            LOG.debug("No OIDC configuration available");
            return false;
        }

        // Use our OidcConfiguration as JAAS javax.security.auth.login.Configuration
        configuration.setConfiguration(configuration.getOidcConfiguration());

        return true;
    }

}
