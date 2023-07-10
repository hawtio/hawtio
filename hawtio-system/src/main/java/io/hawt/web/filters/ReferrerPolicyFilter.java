package io.hawt.web.filters;

import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
 */
public class ReferrerPolicyFilter extends HttpHeaderFilter {

    private static final Logger LOG = LoggerFactory.getLogger(ReferrerPolicyFilter.class);

    public static final String REFERRER_POLICY = "http.referrerPolicy";
    public static final String HAWTIO_REFERRER_POLICY = "hawtio." + REFERRER_POLICY;

    /**
     * Jolokia requires Origin header for CORS access control
     */
    private String headerValue = "strict-origin";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);
        String policy = getConfigParameter(REFERRER_POLICY);
        if (policy != null) {
            headerValue = policy;
        }
        LOG.debug("Referrer-Policy is configured: {}", headerValue);
    }

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        response.addHeader("Referrer-Policy", headerValue);
    }
}
