package io.hawt.springboot.keycloak;

import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Workaround for: https://issues.redhat.com/browse/KEYCLOAK-11282
 */
@Configuration
public class KeycloakConfigResolverConfiguration {

    @Bean
    public KeycloakSpringBootConfigResolver keycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }

}
