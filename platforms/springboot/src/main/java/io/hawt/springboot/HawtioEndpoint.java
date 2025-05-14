package io.hawt.springboot;

import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.boot.actuate.endpoint.web.annotation.WebEndpoint;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriComponents;

/**
 * <p>Web endpoint for Hawtio that integrates with Spring Boot Actuator mechanism.</p>
 *
 * <p>This {@link WebEndpoint @WebEndpoint} adheres to the new way of registering actuator endpoints, but doesn't
 * actually handle any requests. The only {@link ReadOperation @ReadOperation} annotated method let the endpoint
 * to be discovered by {@link org.springframework.boot.actuate.endpoint.web.annotation.WebEndpointDiscoverer}.
 * Actual request handling is done by usual Spring WebMVC controllers and mappings registered by
 * {@link HawtioManagementConfiguration} autoconfiguration class.</p>
 */
@WebEndpoint(id = "hawtio")
public class HawtioEndpoint {

    private final EndpointPathResolver endpointPath;

    public HawtioEndpoint(final EndpointPathResolver endpointPath) {
        this.endpointPath = endpointPath;
    }

    /**
     * Actuator GET request handling method - it'd be invokable only if there's no
     * {@link org.springframework.web.servlet.handler.SimpleUrlHandlerMapping} matching the actuator path. But we
     * keep the method - without it, {@link org.springframework.boot.actuate.endpoint.web.annotation.WebEndpointDiscoverer}
     * would not find it.
     * @return
     */
    @ReadOperation
    public ModelAndView hawtio() {
        final UriComponents uriComponents = ServletUriComponentsBuilder.fromPath(endpointPath.resolveUrlMapping("hawtio"))
            .path("/index.html")
            .build();

        return new ModelAndView("redirect:" + uriComponents.getPath());
    }

}
