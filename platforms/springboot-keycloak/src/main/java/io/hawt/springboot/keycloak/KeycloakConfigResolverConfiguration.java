package io.hawt.springboot.keycloak;

import org.keycloak.adapters.KeycloakConfigResolver;
import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Boot configuration to use custom keycloak.json configuration file.
 * <p>
 * See:
 * - https://www.keycloak.org/docs/21.1.1/securing_apps/index.html#using-spring-boot-configuration
 * - https://issues.redhat.com/browse/KEYCLOAK-11282
 */
@Configuration
public class KeycloakConfigResolverConfiguration {

    @Bean
    public KeycloakConfigResolver keycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }

}
