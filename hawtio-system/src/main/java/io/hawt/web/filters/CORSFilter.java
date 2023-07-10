package io.hawt.web.filters;

import java.util.concurrent.TimeUnit;

import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
 */
public class CORSFilter extends HttpHeaderFilter {

    private static final Logger LOG = LoggerFactory.getLogger(CORSFilter.class);

    public static final String ENABLE_CORS = "http.enableCORS";
    public static final String HAWTIO_ENABLE_CORS = "hawtio." + ENABLE_CORS;

    public static final String ACCESS_CONTROL_ALLOW_ORIGIN = "http.accessControlAllowOrigin";
    public static final String HAWTIO_ACCESS_CONTROL_ALLOW_ORIGIN = "hawtio." + ACCESS_CONTROL_ALLOW_ORIGIN;

    private boolean enabled = false;
    private String headerValue = "*";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);
        String enableCORS = getConfigParameter(ENABLE_CORS);
        if (Boolean.parseBoolean(enableCORS)) {
            enabled = true;
            LOG.debug("CORS enabled");
        }

        String origin = getConfigParameter(ACCESS_CONTROL_ALLOW_ORIGIN);
        if (origin != null) {
            headerValue = origin;
        }
        LOG.debug("Access-Control-Allow-Origin is configured: {}", headerValue);
    }

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        if (!enabled) {
            return;
        }

        if ("OPTIONS".equals(request.getMethod())) {
            response.addHeader("Access-Control-Request-Method", "GET, POST, PUT, DELETE");
            String headers = request.getHeader("Access-Control-Request-Headers");
            if (headers != null) {
                response.addHeader("Access-Control-Allow-Headers", headers);
            }
            response.addHeader("Access-Control-Max-Age", "" + TimeUnit.DAYS.toSeconds(1));
        }
        response.addHeader("Access-Control-Allow-Origin", headerValue);
    }
}
