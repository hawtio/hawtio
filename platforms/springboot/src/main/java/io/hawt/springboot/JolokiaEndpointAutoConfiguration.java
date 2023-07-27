package io.hawt.springboot;

import io.hawt.springboot.JolokiaEndpoint;
import io.hawt.springboot.JolokiaProperties;
import org.jolokia.http.AgentServlet;
import org.springframework.boot.actuate.autoconfigure.endpoint.condition.ConditionalOnAvailableEndpoint;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnClass(AgentServlet.class)
@ConditionalOnAvailableEndpoint(endpoint = JolokiaEndpoint.class)
@EnableConfigurationProperties(JolokiaProperties.class)
public class JolokiaEndpointAutoConfiguration {

    @Bean
    public JolokiaEndpoint jolokiaEndpoint(JolokiaProperties properties) {
        return new JolokiaEndpoint(properties.getConfig());
    }

}
