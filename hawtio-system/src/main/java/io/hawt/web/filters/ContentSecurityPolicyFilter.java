package io.hawt.web.filters;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.net.URI;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.keycloak.KeycloakServlet;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
public class ContentSecurityPolicyFilter extends HttpHeaderFilter {

    private static final transient Logger LOG = LoggerFactory.getLogger(ContentSecurityPolicyFilter.class);

    private static String POLICY = "";
    private static final String POLICY_TEMPLATE =
        "default-src 'self'; " +
        "script-src 'self'%s 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "font-src 'self' data:; " +
        "connect-src 'self'%s; " +
        "frame-src 'self'%s";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);

        String keycloakConfigFile = getConfigParameter(KeycloakServlet.KEYCLOAK_CLIENT_CONFIG);
        if (keycloakConfigFile == null && System.getProperty(KeycloakServlet.HAWTIO_KEYCLOAK_CLIENT_CONFIG) != null) {
            keycloakConfigFile = System.getProperty(KeycloakServlet.HAWTIO_KEYCLOAK_CLIENT_CONFIG);
        }

        boolean addedKeycloakUrl = false;
        if (keycloakConfigFile != null) {
            try (FileReader reader = new FileReader(keycloakConfigFile)) {
                JSONObject json = ServletHelpers.readObject(new BufferedReader(reader));
                String url = (String) json.get("url");
                URI uri = URI.create(url);
                LOG.info("Found Keycloak URL: {}", uri);
                // mind the initial whitespace
                String hostPort = " " + uri.getHost();
                if (uri.getPort() >= 0) {
                    hostPort += ":" + uri.getPort();
                }
                POLICY = String.format(POLICY_TEMPLATE, hostPort, hostPort, hostPort);
                addedKeycloakUrl = true;
            } catch (IOException e) {
                LOG.error("Can't read keycloak configuration file", e);
            }
        }
        if (!addedKeycloakUrl) {
            POLICY = String.format(POLICY_TEMPLATE, "", "", "");
        }
    }

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        response.addHeader("Content-Security-Policy", POLICY);
    }
}
