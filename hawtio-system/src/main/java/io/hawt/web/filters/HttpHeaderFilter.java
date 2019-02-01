package io.hawt.web.filters;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.hawt.system.ConfigManager;

/**
 * Abstract servlet filter for applying HTTP headers to responses.
 */
public abstract class HttpHeaderFilter implements Filter {

    private ConfigManager configManager;

    public HttpHeaderFilter() {
    }

    public void init(FilterConfig filterConfig) throws ServletException {
        configManager = (ConfigManager) filterConfig.getServletContext().getAttribute(ConfigManager.CONFIG_MANAGER);
    }

    public void destroy() {
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
            addHeaders((HttpServletRequest) request, (HttpServletResponse) response);
        }
        chain.doFilter(request, response);
    }

    protected abstract void addHeaders(HttpServletRequest request, HttpServletResponse response)
        throws IOException, ServletException;

    protected String getConfigParameter(String key) {
        return configManager.get(key, null);
    }
}
