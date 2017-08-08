package io.hawt.springboot;

import org.springframework.boot.actuate.endpoint.mvc.AbstractNamedMvcEndpoint;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;

/**
 * Spring Boot endpoint to expose hawtio
 */
public class HawtioEndpoint extends AbstractNamedMvcEndpoint {

    public HawtioEndpoint() {
        super("hawtio", "/hawtio", true);
    }

    @Override
    public void addResourceHandlers(final ResourceHandlerRegistry registry) {
        registry
            .addResourceHandler("/hawtio/plugins/**")
            .addResourceLocations(
                "/app/",
                "classpath:/hawtio-static/app/");
        registry
            .addResourceHandler("/hawtio/**")
            .addResourceLocations(
                "/",
                "/app/",
                "classpath:/hawtio-static/",
                "classpath:/hawtio-static/app/");
        registry
            .addResourceHandler("/img/**")
            .addResourceLocations(
                "classpath:/hawtio-static/img/");
    }

    @Override
    public void addViewControllers(final ViewControllerRegistry registry) {
        registry
            .addViewController("/hawtio/plugin")
            .setViewName("forward:/plugin");
        registry
            .addViewController("/hawtio/")
            .setViewName("redirect:/hawtio/index.html");
    }

}
