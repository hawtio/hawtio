package io.hawt.springboot;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.boot.actuate.endpoint.web.annotation.ControllerEndpoint;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriComponents;

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

    /**
     * Forwards all React router route URLs to index.html.
     * Ignores jolokia paths and paths for other Hawtio resources.
     *
     * @return The Spring Web forward directive for the Hawtio index.html resource.
     */
    @RequestMapping(
        value = {"", "{path:^(?:(?!\\bjolokia\\b|auth|css|fonts|img|js|user|static|\\.).)*$}/**"},
        produces = MediaType.TEXT_HTML_VALUE)
    public String forwardHawtioRequestToIndexHtml(HttpServletRequest request) {
        final String path = endpointPath.resolve("hawtio");

        if (request.getRequestURI().equals(path)) {
            String query = request.getQueryString();
            if (query != null && !query.isEmpty()) {
                return "redirect:" + path + "/index.html?" + query;
            }
            return "redirect:" + path + "/index.html";
        }

        final UriComponents uriComponents = ServletUriComponentsBuilder.fromPath(path)
            .path("/index.html")
            .build();
        return "forward:" + uriComponents.getPath();
    }

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

