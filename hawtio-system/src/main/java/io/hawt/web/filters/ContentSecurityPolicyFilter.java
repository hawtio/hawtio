package io.hawt.web.filters;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
public class ContentSecurityPolicyFilter extends HttpHeaderFilter {

    private static final String POLICY =
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "font-src 'self' data:";

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        response.addHeader("Content-Security-Policy", POLICY);
    }
}
