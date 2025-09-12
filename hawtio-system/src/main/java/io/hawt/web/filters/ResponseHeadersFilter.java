package io.hawt.web.filters;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import io.hawt.web.ForbiddenReason;
import io.hawt.web.ServletHelpers;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Single filter that invokes configured {@link HttpHeaderFilter} without increasing size of the stack trace.
 */
public class ResponseHeadersFilter implements Filter {

    private static final Logger LOG = LoggerFactory.getLogger(ResponseHeadersFilter.class);

    public static final String ALLOW_X_FRAME_SAME_ORIGIN = "http.allowXFrameSameOrigin";
    @SuppressWarnings("unused")
    public static final String HAWTIO_ALLOW_X_FRAME_SAME_ORIGIN = "hawtio." + ALLOW_X_FRAME_SAME_ORIGIN;

    private final List<HttpHeaderFilter> filters = new ArrayList<>();

    public void init(FilterConfig filterConfig) throws ServletException {
        filters.add(new CacheHeadersFilter());
        filters.add(new CORSFilter());
        filters.add(new XFrameOptionsFilter());
        filters.add(new XXSSProtectionFilter());
        filters.add(new XContentTypeOptionsFilter());
        filters.add(new ContentSecurityPolicyFilter());
        filters.add(new StrictTransportSecurityFilter());
        filters.add(new ReferrerPolicyFilter());

        for (HttpHeaderFilter filter : filters) {
            filter.init(filterConfig);
        }
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            for (HttpHeaderFilter filter : filters) {
                LOG.trace("Applying {}", filter.getClass().getSimpleName());

                ForbiddenReason reason = filter.verifyHeaders(httpRequest);
                if (reason != null) {
                    ServletHelpers.doForbidden(httpResponse, reason);
                    return;
                }

                filter.addHeaders(httpRequest, httpResponse);
            }
        }
        chain.doFilter(request, response);
    }

    protected ForbiddenReason verifyHeaders(HttpServletRequest request) {
        return null;
    }

}
