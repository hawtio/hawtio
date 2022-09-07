package io.hawt.web.filters;

import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
 */
public class ReferrerPolicyFilter extends HttpHeaderFilter {

    private static final transient Logger LOG = LoggerFactory.getLogger(ReferrerPolicyFilter.class);

    public static final String REFERRER_POLICY = "http.referrerPolicy";
    public static final String HAWTIO_REFERRER_POLICY = "hawtio." + REFERRER_POLICY;

    private String headerValue = "no-referrer";

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
