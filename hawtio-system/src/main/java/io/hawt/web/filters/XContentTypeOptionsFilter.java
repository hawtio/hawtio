package io.hawt.web.filters;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
 */
public class XContentTypeOptionsFilter extends HttpHeaderFilter {

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        response.addHeader("X-Content-Type-Options", "nosniff");
    }
}
