package io.hawt.web.filters;

import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
 */
public class StrictTransportSecurityFilter extends HttpHeaderFilter {

    private static final transient Logger LOG = LoggerFactory.getLogger(PublicKeyPinningFilter.class);

    private static final String STRICT_TRANSPORT_SECURITY = "http.strictTransportSecurity";

    private String headerValue;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);
        headerValue = getConfigParameter(STRICT_TRANSPORT_SECURITY);
        if (headerValue != null) {
            LOG.debug("HTTP Strict Transport Security is enabled: {}", headerValue);
        } else {
            LOG.debug("HTTP Strict Transport Security is disabled");
        }
    }

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        if (headerValue != null) {
            response.addHeader("Strict-Transport-Security", headerValue);
        }
    }
}
