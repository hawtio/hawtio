package io.hawt.springboot;

import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.boot.actuate.endpoint.web.annotation.WebEndpoint;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriComponents;

/**
 * Web endpoint that provides access to Hawtio, a web console for JVM management.
 * This endpoint integrates Hawtio with Spring Boot Actuator and configures the necessary
 * resource handlers to serve Hawtio's static resources.
 */
@WebEndpoint(id = "hawtio")
public class HawtioEndpoint implements WebMvcConfigurer {

    private final EndpointPathResolver endpointPath;

    public HawtioEndpoint(final EndpointPathResolver endpointPath) {
        this.endpointPath = endpointPath;
    }

    @ReadOperation
    public ModelAndView hawtio() {
        final UriComponents uriComponents = ServletUriComponentsBuilder.fromPath(endpointPath.resolveUrlMapping("hawtio"))
            .path("/index.html")
            .build();

        return new ModelAndView("redirect:" + uriComponents.getPath());
    }

    @Override
    public void addResourceHandlers(final ResourceHandlerRegistry registry) {
        // @formatter:off
        // Hawtio React static resources
        registry
            .addResourceHandler(endpointPath.resolveUrlMapping("hawtio", "/**"))
            .addResourceLocations(
                "/",
                "classpath:/hawtio-static/");
        registry
            .addResourceHandler(endpointPath.resolveUrlMapping("hawtio", "/static/**"))
            .addResourceLocations(
                "/static/",
                "classpath:/hawtio-static/static/");
        registry
            .addResourceHandler(endpointPath.resolveUrlMapping("hawtio", "/img/**"))
            .addResourceLocations("classpath:/hawtio-static/img/");
        // @formatter:on
    }
}
