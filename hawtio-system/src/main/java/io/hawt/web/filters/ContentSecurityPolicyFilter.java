package io.hawt.web.filters;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
public class ContentSecurityPolicyFilter extends HttpHeaderFilter {

    private static final String POLICY = "default-src 'self'";

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        // TODO disabled for now...
        //response.addHeader("Content-Security-Policy", POLICY);
    }
}
