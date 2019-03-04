package io.hawt.springboot;

import java.util.List;

import org.springframework.boot.actuate.endpoint.mvc.AbstractNamedMvcEndpoint;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriComponents;

/**
 * Spring Boot endpoint to expose hawtio.
 */
@ConfigurationProperties(prefix = "endpoints.hawtio", ignoreUnknownFields = false)
public class HawtioEndpoint extends AbstractNamedMvcEndpoint {

    private final ServerPathHelper serverPathHelper;
    private List<HawtPlugin> plugins;

    public HawtioEndpoint(final ServerPathHelper serverPathHelper) {
        super("hawtio", "/hawtio", true);
        this.serverPathHelper = serverPathHelper;
    }

    public void setPlugins(final List<HawtPlugin> plugins) {
        this.plugins = plugins;
    }

    /**
     * Forwards all Angular route URLs to index.html.
     *
     * Ignores jolokia paths and paths for other Hawtio resources.
     *
     * @return The Spring Web forward directive for the Hawtio index.html resource.
     */
    @RequestMapping(value = {"", "{path:^(?:(?!\\bjolokia\\b|auth|css|fonts|img|js|oauth|\\.).)*$}/**"}, produces = MediaType.TEXT_HTML_VALUE)
    public String forwardHawtioRequestToIndexHtml() {
        UriComponents uriComponents = ServletUriComponentsBuilder.fromPath(serverPathHelper.getPathFor(getPath()))
            .path("/index.html")
            .build();
        return "forward:" + uriComponents.getPath();
    }

    @RequestMapping("/plugin")
    @ResponseBody
    public List<HawtPlugin> getPlugins() {
        return plugins;
    }

    @Override
    public void addResourceHandlers(final ResourceHandlerRegistry registry) {
        registry // @formatter:off
            .addResourceHandler(serverPathHelper.getResourceHandlerPathFor(getPath(), "/plugins/**"))
            .addResourceLocations(
                "/app/",
                "classpath:/hawtio-static/app/");
        registry
            .addResourceHandler(serverPathHelper.getResourceHandlerPathFor(getPath(), "/**"))
            .addResourceLocations(
                "/",
                "/app/",
                "classpath:/hawtio-static/",
                "classpath:/hawtio-static/app/");
        registry
            .addResourceHandler("/img/**")
            .addResourceLocations("classpath:/hawtio-static/img/"); // @formatter:on
    }
}
