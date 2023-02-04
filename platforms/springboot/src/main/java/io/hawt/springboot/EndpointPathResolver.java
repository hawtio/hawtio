package io.hawt.springboot;

import io.hawt.util.Strings;

import java.util.Map;

import org.springframework.boot.actuate.autoconfigure.endpoint.web.WebEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.web.server.ManagementServerProperties;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.autoconfigure.web.servlet.DispatcherServletPath;

public class EndpointPathResolver {

    private final WebEndpointProperties webEndpointProperties;
    private final ServerProperties serverProperties;
    private final ManagementServerProperties managementServerProperties;
    private final DispatcherServletPath dispatcherServletPath;

    public EndpointPathResolver(final WebEndpointProperties webEndpointProperties,
                                final ServerProperties serverProperties,
                                final ManagementServerProperties managementServerProperties,
                                final DispatcherServletPath dispatcherServletPath) {
        this.webEndpointProperties = webEndpointProperties;
        this.serverProperties = serverProperties;
        this.managementServerProperties = managementServerProperties;
        this.dispatcherServletPath = dispatcherServletPath;
    }

    public String resolve(final String endpointName) {
        final Map<String, String> pathMapping = webEndpointProperties.getPathMapping();
        final String basePath = webEndpointProperties.getBasePath();
        final String servletPath = dispatcherServletPath.getPath();
        String endpointPathMapping = pathMapping.get(endpointName);

        if (endpointPathMapping == null) {
            endpointPathMapping = endpointName;
        }

        final String webContextPath = Strings.webContextPath(servletPath, basePath, endpointPathMapping);
        return webContextPath.isEmpty() ? "/" : webContextPath;
    }

    public String resolveUrlMapping(String endpointName, String... mappings) {
        String servletPath = dispatcherServletPath.getPath();
        String endpointPath = resolve(endpointName);

        if (!servletPath.equals("/")) {
            endpointPath = endpointPath.replace(servletPath, "");
        }

        return Strings.webContextPath(endpointPath, mappings);
    }

    public String resolveContextPath() {
        final Integer serverPort = serverProperties.getPort();
        final Integer managementServerPort = managementServerProperties.getPort();
        String contextPath;

        if (serverPort == null || managementServerPort == null || serverPort.equals(managementServerProperties.getPort())) {
            contextPath = serverProperties.getServlet().getContextPath();
        } else {
            contextPath = managementServerProperties.getBasePath();
        }

        return Strings.webContextPath(contextPath);
    }
}
