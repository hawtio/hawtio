package io.hawt.springboot;

import java.util.List;


import org.springframework.boot.actuate.endpoint.web.annotation.ControllerEndpoint;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * <p>Spring Boot endpoint to expose Hawtio. It is more tightly integrated with Spring MVC than
 * {@link org.springframework.boot.actuate.endpoint.annotation.Endpoint} and methods annotated with
 * {@link RequestMapping} are invoked by {@link org.springframework.web.servlet.DispatcherServlet} through
 * {@link org.springframework.web.servlet.HandlerAdapter}.</p>
 *
 * <p>The implication is that {@link RequestMapping} methods are called after DispatcherServlet and after
 * all mapped Hawtio filters.</p>
 */
@ControllerEndpoint(id = "hawtio")
public class HawtioEndpoint implements WebMvcConfigurer {

    private final EndpointPathResolver endpointPath;
    private List<HawtioPlugin> plugins;

    public HawtioEndpoint(final EndpointPathResolver endpointPath) {
        this.endpointPath = endpointPath;
    }

    public void setPlugins(final List<HawtioPlugin> plugins) {
        this.plugins = plugins;
    }

    // forwardHawtioRequestToIndexHtml() with "{path:^(?:(?!\bjolokia\b|auth|css|fonts|img|js|user|static|\.).)*$}/**"
    // mapping is no longer needed - everything is handled by ClientRouteRedirectFilter

    @RequestMapping("/plugin")
    @ResponseBody
    public List<HawtioPlugin> getPlugins() {
        return plugins;
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
