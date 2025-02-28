package io.hawt.web.filters;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.util.Strings;
import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.keycloak.KeycloakServlet;
import io.hawt.web.auth.oidc.OidcConfiguration;
import org.jolokia.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP">MDN: Content-Security-Policy</a>
 */
public class ContentSecurityPolicyFilter extends HttpHeaderFilter {

    private static final Logger LOG = LoggerFactory.getLogger(ContentSecurityPolicyFilter.class);

    private String policy = "";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);

        List<String> defaultSrc = new ArrayList<>(List.of("'self'"));
        List<String> connectSrc = new ArrayList<>(List.of("'self'"));
        List<String> fontSrc = new ArrayList<>(List.of("'self'", "data:"));
        List<String> frameSrc = new ArrayList<>(List.of("'self'"));
        List<String> imgSrc = new ArrayList<>(List.of("'self'", "data:"));
        List<String> manifestSrc = new ArrayList<>(List.of("'self'"));
        List<String> mediaSrc = new ArrayList<>(List.of("'self'"));
        List<String> objectSrc = new ArrayList<>(List.of("'self'"));
        List<String> scriptSrc = new ArrayList<>(List.of("'self'"));
        List<String> styleSrc = new ArrayList<>(List.of("'self'"));
        List<String> workerSrc = new ArrayList<>(List.of("'self'"));
        List<String> scriptSrcElem = new ArrayList<>(List.of("'self'"));
        List<String> styleSrcElem = new ArrayList<>(List.of("'self'"));
        List<String> formAction = new ArrayList<>(List.of("'self'"));

        List<String> frameAncestors = new ArrayList<>();
        if (isXFrameSameOriginAllowed()) {
            frameAncestors.add("'self'");
        } else {
            frameAncestors.add("'none'");
        }

        // necessary for monaco-editor to load properly:
        styleSrc.add("'unsafe-inline'");
        styleSrcElem.add("'unsafe-inline'");
        workerSrc.add("blob:");
        // add keycloak server as safe source for connect, script, frame and prefetch
        String keycloakConfigFile = getConfigParameter(KeycloakServlet.KEYCLOAK_CLIENT_CONFIG);
        if (System.getProperty(KeycloakServlet.HAWTIO_KEYCLOAK_CLIENT_CONFIG) != null) {
            keycloakConfigFile = System.getProperty(KeycloakServlet.HAWTIO_KEYCLOAK_CLIENT_CONFIG);
        }

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
                connectSrc.add(cspSrc);
                frameSrc.add(cspSrc);
                scriptSrc.add(cspSrc);
            } catch (Exception e) {
                LOG.error("Can't read keycloak configuration file", e);
            }
        }

        // add OIDC provider as safe source for connect, script, frame and prefetch
        AuthenticationConfiguration authConfig
            = AuthenticationConfiguration.getConfiguration(filterConfig.getServletContext());
        if (authConfig.isEnabled() && authConfig.getOidcConfiguration() != null
            && authConfig.getOidcConfiguration().isEnabled()) {
            OidcConfiguration oidcConfiguration = authConfig.getOidcConfiguration();
            URL url = oidcConfiguration.getProviderURL();
            if (url != null) {
                String oidcSrc = String.format("%s://%s%s", url.getProtocol(),
                    url.getHost(), (url.getPort() > 0 ? ":" + url.getPort() : ""));
                connectSrc.add(oidcSrc);
                frameSrc.add(oidcSrc);
                scriptSrc.add(oidcSrc);
            }
        }

        StringBuilder builder = new StringBuilder();
        addPolicy(builder, "default-src", defaultSrc);
        addPolicy(builder, "script-src", scriptSrc);
        addPolicy(builder, "style-src", styleSrc);
        addPolicy(builder, "font-src", fontSrc);
        addPolicy(builder, "img-src", imgSrc);
        addPolicy(builder, "connect-src", connectSrc);
        addPolicy(builder, "frame-src", frameSrc);
        addPolicy(builder, "manifest-src", manifestSrc);
        addPolicy(builder, "media-src", mediaSrc);
        addPolicy(builder, "object-src", objectSrc);
        addPolicy(builder, "worker-src", workerSrc);
        addPolicy(builder, "frame-ancestors", frameAncestors);
        addPolicy(builder, "script-src-elem", scriptSrcElem);
        addPolicy(builder, "style-src-elem", styleSrcElem);
        addPolicy(builder, "form-action", formAction);

        policy = builder.toString().trim();
        policy = policy.substring(0, policy.length() - 1);
    }

    private void addPolicy(StringBuilder builder, String name, List<String> sources) {
        builder.append(name);
        sources.forEach(s -> builder.append(" ").append(s));
        builder.append("; ");
    }

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        response.addHeader("Content-Security-Policy", policy);
    }
}
