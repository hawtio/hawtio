package io.hawt.web.filters;

import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
 */
public class XFrameOptionsFilter extends HttpHeaderFilter {

    private static final transient Logger LOG = LoggerFactory.getLogger(XFrameOptionsFilter.class);

    private String headerValue = "DENY";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);
        if (isXFrameSameOriginAllowed()) {
            headerValue = "SAMEORIGIN";
        }
        LOG.debug("X-Frame-Options is configured: {}", headerValue);
    }

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        response.addHeader("X-Frame-Options", headerValue);
    }
}
