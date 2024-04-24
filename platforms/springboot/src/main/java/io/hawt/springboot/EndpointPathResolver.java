package io.hawt.springboot;

import java.util.Map;

import io.hawt.util.WebHelper;
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

    /**
     * <p>Converts Spring actuator endpoint's name/id (See: <a href="https://docs.spring.io/spring-boot/docs/3.2.4/reference/html/actuator.html#actuator.endpoints">Endpoints</a>)
     * (standard endpoints: {@code health}, {@code info}, ..., Hawtio endpoints: {@code hawtio}, {@code jolokia}) into
     * an <em>absolute path</em> (starting with {@code /}) within Spring Boot context path. Spring Boot configuration
     * is taken into account ({@code spring.mvc.servlet.path} and {@code management.endpoints.web.base-path}).
     * Context path (configured with {@code server.servlet.context-path} or {@code management.server.base-path}) is
     * not a part of the returned path, as all resolved paths are relative to the context.</p>
     *
     * <p>Spring Boot may run two separate web containers:<ul>
     *     <li>Main server (with port configured using {@code server.port} property)</li>
     *     <li>Management server (with port configured using {@code management.server.port} property)</li>
     * </ul>
     * If there's no distinct {@code management.server.port} value, there's only one server.</p>
     *
     * <p>Both servers may have customized <em>context path</em>:<ul>
     *     <li>Main server - with {@code server.servlet.context-path} property</li>
     *     <li>Management server - with {@code management.server.base-path} property</li>
     * </ul>
     * Additionally, Management server can use {@code management.endpoints.web.base-path} property to change default
     * {@code /actuator} prefix. And finally, when there's no separate Management server, management endpoints use
     * additional prefix configured with {@code spring.mvc.servlet.path} property.</p>
     *
     * @param endpointName
     * @return
     */
    public String resolve(final String endpointName) {
        final Map<String, String> pathMapping = webEndpointProperties.getPathMapping();
        // "server.servlet.context-path" and "management.server.base-path" are NOT needed here, as
        // we do all URL operations context-relative.
        // So whether you set (or not) context paths, these should be not used
        // "spring.mvc.servlet.path"

        Integer mgmtPort = managementServerProperties.getPort();
        String servletPath = dispatcherServletPath.getPath();
        if (mgmtPort != null && !mgmtPort.equals(serverProperties.getPort())) {
            // this now defaults to "/"
            servletPath = "/";
        }

        final String basePath = webEndpointProperties.getBasePath();
        String endpointPathMapping = pathMapping.get(endpointName);

        if (endpointPathMapping == null) {
            endpointPathMapping = endpointName;
        }

        final String webContextPath = WebHelper.webContextPath(servletPath, basePath, endpointPathMapping);
        return webContextPath.isEmpty() ? "/" : webContextPath;
    }

    public String resolveUrlMapping(String endpointName, String... mappings) {
        String servletPath = dispatcherServletPath.getPath();
        String endpointPath = resolve(endpointName);

        if (!servletPath.equals("/")) {
            endpointPath = endpointPath.replace(servletPath, "");
        }

        return WebHelper.webContextPath(endpointPath, mappings);
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

        return WebHelper.webContextPath(contextPath);
    }
}
