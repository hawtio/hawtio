package io.hawt.springboot;

import io.hawt.util.Strings;

import org.springframework.boot.actuate.autoconfigure.ManagementServerProperties;
import org.springframework.boot.autoconfigure.web.ServerProperties;

public class ServerPathHelper {

    private final ServerProperties serverProperties;
    private final ManagementServerProperties managementServerProperties;

    public ServerPathHelper(final ServerProperties serverProperties,
                            final ManagementServerProperties managementServerProperties) {
        this.serverProperties = serverProperties;
        this.managementServerProperties = managementServerProperties;
    }

    public String getPathFor(String... paths) {
        return Strings.webContextPath(getBasePath(), paths);
    }

    public String getResourceHandlerPathFor(String... paths) {
        return Strings.webContextPath(managementServerProperties.getContextPath(), paths);
    }

    public String getBasePath() {
        return Strings.webContextPath(getServletPrefix(), managementServerProperties.getContextPath());
    }

    private String getServletPrefix() {
        String servletPrefix = managementPortEqualsServerPort() ? serverProperties.getServletPrefix() : "";
        return Strings.webContextPath(servletPrefix);
    }

    private boolean managementPortEqualsServerPort() {
        final int serverPort = getOrDefault(serverProperties.getPort(), 8080);
        final int managementPort = getOrDefault(managementServerProperties.getPort(), serverPort);
        return serverPort == managementPort;
    }

    private int getOrDefault(final Integer number, final int defaultValue) {
        return number == null ? defaultValue : number;
    }
}
