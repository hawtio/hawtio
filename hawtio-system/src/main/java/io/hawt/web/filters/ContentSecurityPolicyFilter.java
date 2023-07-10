package io.hawt.web.filters;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.util.Objects;

import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.util.Strings;
import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.keycloak.KeycloakServlet;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
public class ContentSecurityPolicyFilter extends HttpHeaderFilter {

    private static final Logger LOG = LoggerFactory.getLogger(ContentSecurityPolicyFilter.class);

    private static final String POLICY_TEMPLATE =
        "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' %s; " +
            "style-src 'self' 'unsafe-inline'; " +
            "font-src 'self' data:; " +
            "img-src 'self' data:; " +
            "connect-src 'self' %s; " +
            "frame-src 'self' %s; " +
            "frame-ancestors %s";

    private String policy = "";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);

        String keycloakConfigFile = getConfigParameter(KeycloakServlet.KEYCLOAK_CLIENT_CONFIG);
        if (System.getProperty(KeycloakServlet.HAWTIO_KEYCLOAK_CLIENT_CONFIG) != null) {
            keycloakConfigFile = System.getProperty(KeycloakServlet.HAWTIO_KEYCLOAK_CLIENT_CONFIG);
        }

        String frameAncestors = isXFrameSameOriginAllowed() ? "'self'" : "'none'";

        boolean addedKeycloakUrl = false;
        if (Strings.isNotBlank(keycloakConfigFile)) {
            LOG.debug("Reading Keycloak config file from {}", keycloakConfigFile);
            try (InputStream is = ServletHelpers.loadFile(keycloakConfigFile);
                 BufferedReader reader = new BufferedReader(new InputStreamReader(Objects.requireNonNull(is)))) {
                JSONObject json = ServletHelpers.readObject(reader);
                String url = (String) json.get("url");
                URI uri = URI.create(url);
                LOG.info("Found Keycloak URL: {}", uri);
                String cspSrc = uri.getScheme() + "://" + uri.getHost();
                if (uri.getPort() >= 0) {
                    cspSrc += ":" + uri.getPort();
                }
                policy = String.format(POLICY_TEMPLATE, cspSrc, cspSrc, cspSrc, frameAncestors);
                addedKeycloakUrl = true;
            } catch (Exception e) {
                LOG.error("Can't read keycloak configuration file", e);
            }
        }
        if (!addedKeycloakUrl) {
            policy = String.format(POLICY_TEMPLATE, "", "", "", frameAncestors);
        }
    }

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        response.addHeader("Content-Security-Policy", policy);
    }
}
