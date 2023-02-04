package io.hawt.springboot;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.actuate.autoconfigure.endpoint.condition.ConditionalOnAvailableEndpoint;
import org.springframework.boot.actuate.autoconfigure.endpoint.web.WebEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.web.server.ManagementServerProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.autoconfigure.web.servlet.DispatcherServletPath;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

/**
 * Autoconfiguration for Hawtio on Spring Boot.
 */
@Configuration
@ConditionalOnWebApplication
@PropertySource("classpath:/io/hawt/springboot/application.properties")
@EnableConfigurationProperties
public class HawtioEndpointAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnAvailableEndpoint
    public HawtioEndpoint hawtioEndpoint(final EndpointPathResolver endpointPathResolver) {
        return new HawtioEndpoint(endpointPathResolver);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean(HawtioEndpoint.class)
    public EndpointPathResolver hawtioEndpointPathResolver(
        WebEndpointProperties webEndpointProperties,
        ServerProperties serverProperties,
        ManagementServerProperties managementServerProperties,
        DispatcherServletPath dispatcherServletPath) {
        return new EndpointPathResolver(webEndpointProperties, serverProperties, managementServerProperties, dispatcherServletPath);
    }

    @Bean
    @ConditionalOnBean(HawtioEndpoint.class)
    @ConfigurationProperties
    protected HawtioConfigurationProperties hawtioConfigurationProperties() {
        return new HawtioConfigurationProperties();
    }

    @Bean
    @ConditionalOnBean(HawtioConfigurationProperties.class)
    public HawtioProperties hawtioProperties(HawtioConfigurationProperties hawtioConfigurationProperties) {
        return new HawtioProperties(hawtioConfigurationProperties.getHawtio());
    }

    private static class HawtioConfigurationProperties {
        private final Map<String, String> hawtio = new HashMap<>();

        public Map<String, String> getHawtio() {
            return hawtio;
        }
    }
}
