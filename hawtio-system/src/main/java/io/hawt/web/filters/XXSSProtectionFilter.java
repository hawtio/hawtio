package io.hawt.web.filters;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
 */
public class XXSSProtectionFilter extends HttpHeaderFilter {

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        response.addHeader("X-XSS-Protection", "1");
    }
}
