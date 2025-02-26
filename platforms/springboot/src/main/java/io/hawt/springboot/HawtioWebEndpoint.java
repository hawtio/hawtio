package io.hawt.springboot;

import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.boot.actuate.endpoint.web.annotation.WebEndpoint;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
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
@WebEndpoint(id = "hawtio")
public class HawtioWebEndpoint implements WebMvcConfigurer {

    private final EndpointPathResolver endpointPath;

    public HawtioWebEndpoint(final EndpointPathResolver endpointPath) {
        this.endpointPath = endpointPath;
    }

    @ReadOperation
    public ModelAndView jolokia() {
        return new ModelAndView("redirect:/actuator/hawtio/index.html");
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
