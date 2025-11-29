package io.hawt.springboot;

import org.springframework.boot.actuate.autoconfigure.endpoint.condition.ConditionalOnAvailableEndpoint;
import org.springframework.boot.actuate.autoconfigure.endpoint.expose.EndpointExposure;
import org.springframework.boot.actuate.autoconfigure.endpoint.web.WebEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.web.server.ManagementServerProperties;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBooleanProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication.Type;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.autoconfigure.web.servlet.DispatcherServletPath;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * <p>This autoconfiguration ensures that we can see {@code /hawtio} link under {@code /actuator} page. We need
 * it in <em>main context</em> (not the <em>management context</em>), because that's how
 * {@link org.springframework.boot.actuate.endpoint.web.annotation.WebEndpoint web endpoints} are discovered.</p>
 *
 * <p>This is also the only {@link org.springframework.context.annotation.Configuration} which:<ul>
 *     <li>adds Hawtio's {@link PropertySource} based on internal {@code application.properties} to the environment</li>
 *     <li>uses {@link EnableConfigurationProperties} to declare that one of the {@link Bean} methods
 *     is annotated with {@link ConfigurationProperties}</li>
 * </ul></p>
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = Type.SERVLET)
@ConditionalOnBooleanProperty(value = "hawtio.enabled", havingValue = true, matchIfMissing = true)
@PropertySource("classpath:/io/hawt/springboot/application.properties")
@EnableConfigurationProperties
public class HawtioEndpointAutoConfiguration {

    /**
     * <p>{@link org.springframework.boot.actuate.endpoint.web.annotation.WebEndpoint}-annotated actuator endpoint
     * for Hawtio.</p>
     * <p>Before Spring Boot has deprecated it in
     * <a href="https://github.com/spring-projects/spring-boot/issues/31768">spring-projects/spring-boot#31768</a>,
     * Hawtio was using {@code @ControllerEndpoint} annotation that registered Hawtio's
     * {@link org.springframework.web.servlet.mvc.Controller} as actuator endpoint.</p>
     *
     * @param endpointPathResolver
     * @return
     */
    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnAvailableEndpoint(exposure = EndpointExposure.WEB)
    public HawtioEndpoint hawtioMvcConfigurer(final EndpointPathResolver endpointPathResolver) {
        return new HawtioEndpoint(endpointPathResolver);
    }

    /**
     * <p>Helper bean for dealing with context paths and URI prefixes for Hawtio.</p>
     *
     * <p>Its responsibility is to provide single helper class for dealing with URI prefixes for Hawtio
     * depending on "main" and "management" context configuration options:<ul>
     *     <li>server.servlet.context-path (context path for main context)</li>
     *     <li>management.server.base-path (context path for management context)</li>
     *     <li>spring.mvc.servlet.path (dispatcher servlet mapping prefix for main context - no equivalent for management context)</li>
     *     <li>management.endpoints.web.base-path (actuator base path, defaults to {@code /actuator}</li>
     *     <li>management.endpoints.web.path-mapping (endpoint id to path prefix mapping}</li>
     * </ul></p>
     *
     * <p>It's good to know where the dependencies (parameters) come from:<ul>
     *     <li>{@link ServerProperties} - related to "main context" and {@code server.} prefixed properties</li>
     *     <li>{@link WebEndpointProperties} - related to "management context", but come from
     *     {@code /META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports}. For
     *     {@code management.endpoints.web.} prefixed properties.</li>
     *     <li>{@link ManagementServerProperties} - related to "main context", but come from
     *     {@code /META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports}. For
     *     {@code management.server.} prefixed properties.</li>
     *     <li>{@link DispatcherServletPath} - there are two of these:<pre>
     *         DispatcherServletRegistrationBean@9480 = "dispatcherServlet urls=[/]"
     *         DispatcherServletRegistrationBean@9481 = "dispatcherServletRegistration urls=[/]"
     *     </pre></li>
     *     one is for "main" and the other for "management" context and give access to
     *     {@link org.springframework.web.servlet.DispatcherServlet DispatcherServlet} configuration - remember, that actuator web endpoints
     *     are also invoked via Spring MVC using this servlet. But here we're getting the "main" one, because this
     *     {@link org.springframework.context.annotation.Configuration @Configuration} class is for "main" context.
     * </ul></p>
     *
     * @param webEndpointProperties
     * @param serverProperties
     * @param managementServerProperties
     * @param dispatcherServletPath
     * @return
     */
    // NOTE: if we used @ConditionalOnMissingBean(search = SearchStrategy.CURRENT) and we had separate
    //       main and management contexts and this autoconfiguration class was declared in both
    //       /META-INF/spring/*.imports we'd end up with two instances and each would use different
    //       org.springframework.boot.autoconfigure.web.servlet.DispatcherServletRegistrationBean
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

    /**
     * <p>This {@link Bean} will collect {@code hawtio.} prefixed properties from the
     * {@link org.springframework.core.env.Environment}.</p>
     *
     * <p>Ideally we should specify a {@code hawtio} prefix in {@link ConfigurationProperties#prefix()}, but then
     * the configuration class would need a field declared for every possible configuration option used by Hawtio.
     * For the record, Jolokia uses a {@link ConfigurationProperties} bean with one field - {@code config} which
     * is a Map and properies need to be specified as {@code <prefix>.config.<key> = <value>}...</p>
     *
     * @return
     */
    @Bean
    @ConditionalOnBean(HawtioEndpoint.class)
    @ConfigurationProperties
    protected HawtioConfigurationProperties hawtioConfigurationProperties() {
        return new HawtioConfigurationProperties();
    }

    /**
     * This bean uses {@link HawtioConfigurationProperties} and declares actual {@link HawtioProperties}
     * that should be used for dependency injection on other Hawtio Spring beans.
     *
     * @param hawtioConfigurationProperties
     * @return
     */
    @Bean
    @ConditionalOnBean(HawtioConfigurationProperties.class)
    public HawtioProperties hawtioProperties(HawtioConfigurationProperties hawtioConfigurationProperties) {
        return new HawtioProperties(hawtioConfigurationProperties.getHawtio());
    }

    /**
     * A class that allows use to use {@code hawtio.} prefixed properties without using
     * {@link ConfigurationProperties#prefix()}
     */
    public static class HawtioConfigurationProperties {
        private final Map<String, String> hawtio = new HashMap<>();

        public Map<String, String> getHawtio() {
            return hawtio;
        }
    }

}
