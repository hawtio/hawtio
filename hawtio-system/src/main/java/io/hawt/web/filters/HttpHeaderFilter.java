package io.hawt.web.filters;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.system.ConfigManager;
import io.hawt.web.ForbiddenReason;
import io.hawt.web.ServletHelpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Abstract servlet filter for applying HTTP headers to responses.
 */
public abstract class HttpHeaderFilter implements Filter {

    private static final Logger LOG = LoggerFactory.getLogger(HttpHeaderFilter.class);

    public static final String ALLOW_X_FRAME_SAME_ORIGIN = "http.allowXFrameSameOrigin";

    private ConfigManager configManager;

    public HttpHeaderFilter() {
    }

    public void init(FilterConfig filterConfig) throws ServletException {
        configManager = (ConfigManager) filterConfig.getServletContext().getAttribute(ConfigManager.CONFIG_MANAGER);
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            ForbiddenReason reason = verifyHeaders(httpRequest);
            if (reason != null) {
                ServletHelpers.doForbidden(httpResponse, reason);
                return;
            }

            addHeaders(httpRequest, httpResponse);
        }
        chain.doFilter(request, response);
    }

    protected ForbiddenReason verifyHeaders(HttpServletRequest request) {
        return null;
    }

    protected abstract void addHeaders(HttpServletRequest request, HttpServletResponse response)
        throws IOException, ServletException;

    protected String getConfigParameter(String key) {
        return configManager.get(key).orElse(null);
    }

    protected boolean isXFrameSameOriginAllowed() {
        String allow = getConfigParameter(ALLOW_X_FRAME_SAME_ORIGIN);
        return Boolean.parseBoolean(allow);
    }
}
