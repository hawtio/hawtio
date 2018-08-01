package io.hawt.web.filters;

import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Public_Key_Pinning
 */
public class PublicKeyPinningFilter extends HttpHeaderFilter {

    private static final transient Logger LOG = LoggerFactory.getLogger(PublicKeyPinningFilter.class);

    private static final String PUBLIC_KEY_PINS = "http.publicKeyPins";

    private String headerValue;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);
        headerValue = getConfigParameter(PUBLIC_KEY_PINS);
        if (headerValue != null) {
            LOG.debug("Public Key Pinning is enabled: {}", headerValue);
        } else {
            LOG.debug("Public Key Pinning is disabled");
        }
    }

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        if (headerValue != null) {
            response.addHeader("Public-Key-Pins", headerValue);
        }
    }
}
