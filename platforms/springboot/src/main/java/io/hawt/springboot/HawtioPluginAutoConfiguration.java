package io.hawt.springboot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.actuate.autoconfigure.web.ManagementContextConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.lang.reflect.Method;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Spring AutoConfiguration for the management endpoint /hawtio/plugin
 */
@ManagementContextConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@PropertySource("classpath:/io/hawt/springboot/application.properties")
@EnableConfigurationProperties
public class HawtioPluginAutoConfiguration {

    /**
     *
     * This bean creates a Spring controller that is added to the ManagementContext (/actuator).
     *
     * @param endpointPathResolver
     * @param requestMappingHandlerMapping
     * @param plugins
     * @return
     * @throws NoSuchMethodException
     */
    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean(EndpointPathResolver.class)
    public HawtioPluginController hawtioRequestHandler(final EndpointPathResolver endpointPathResolver,
                                                       // This Qualifier is mandatory right now, but once the deprecated classes will be removed in SB 3.5, the Qualifier can be removed as well
                                                       @Autowired @Qualifier("requestMappingHandlerMapping") final RequestMappingHandlerMapping requestMappingHandlerMapping,
                                                       @Autowired final Optional<List<HawtioPlugin>> plugins) throws NoSuchMethodException {
        HawtioPluginController hawtioRequestHandler = new HawtioPluginController(endpointPathResolver);
        hawtioRequestHandler.setPlugins(plugins.orElse(Collections.emptyList()));

        Method getPlugins = HawtioPluginController.class.getMethod("getPlugins");
        RequestMappingInfo getPluginsMappingInfo = RequestMappingInfo
            .paths(endpointPathResolver.resolveUrlMapping("hawtio") + "/plugin")
            .methods(RequestMethod.GET)
            .build();
        requestMappingHandlerMapping.registerMapping(getPluginsMappingInfo, hawtioRequestHandler, getPlugins);

        return hawtioRequestHandler;
    }
}
