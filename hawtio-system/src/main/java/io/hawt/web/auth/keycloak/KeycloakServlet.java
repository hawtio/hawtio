package io.hawt.web.auth.keycloak;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import io.hawt.system.ConfigManager;
import io.hawt.util.IOHelper;
import io.hawt.util.Strings;
import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.AuthenticationConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Servlet, which aims to return:
 * - whether keycloak is enabled (true/false) if path '/enabled' is used
 * - keycloak.json to be used by keycloak JS adapter on frontend if path '/client-config' is used
 * - validate if current JAAS logged subject is same like SSO user logged through keycloak
 * if path '/validate-subject-matches' is used
 */
public class KeycloakServlet extends HttpServlet {

    private static final long serialVersionUID = 3464713772839013741L;

    private static final Logger LOG = LoggerFactory.getLogger(KeycloakServlet.class);

    public static final String KEYCLOAK_CLIENT_CONFIG = "keycloakClientConfig";

    public static final String HAWTIO_KEYCLOAK_CLIENT_CONFIG = "hawtio." + KEYCLOAK_CLIENT_CONFIG;

    private String keycloakConfig = null;
    private boolean keycloakEnabled;

    @Override
    public void init() {
        ConfigManager config = (ConfigManager) getServletContext().getAttribute(ConfigManager.CONFIG_MANAGER);

        AuthenticationConfiguration authConfig = AuthenticationConfiguration.getConfiguration(getServletContext());
        keycloakEnabled = authConfig.isKeycloakEnabled();
        LOG.info("Keycloak integration is {}", this.keycloakEnabled ? "enabled" : "disabled");
        if (!keycloakEnabled) {
            return;
        }

        String keycloakConfigFile = config.get(KEYCLOAK_CLIENT_CONFIG).orElse(null);

        // JVM system properties can override always
        if (System.getProperty(HAWTIO_KEYCLOAK_CLIENT_CONFIG) != null) {
            keycloakConfigFile = System.getProperty(HAWTIO_KEYCLOAK_CLIENT_CONFIG);
        }

        if (Strings.isBlank(keycloakConfigFile)) {
            keycloakConfigFile = defaultKeycloakConfigLocation();
        }

        LOG.info("Will load keycloak config from location: {}", keycloakConfigFile);

        InputStream is = ServletHelpers.loadFile(keycloakConfigFile);
        if (is == null) {
            LOG.warn("Keycloak client configuration not found!");
        } else {
            try {
                BufferedReader reader = new BufferedReader(new InputStreamReader(is));
                String keycloakConfig = IOHelper.readFully(reader);

                // Minify for perf purposes
                this.keycloakConfig = keycloakConfig.replaceAll(" ", "").replaceAll(System.lineSeparator(), "");
            } catch (IOException ioe) {
                LOG.warn("Couldn't read keycloak configuration file", ioe);
            } finally {
                IOHelper.close(is, "keycloakInputStream", LOG);
            }
        }
    }

    /**
     * Will try to guess the config location based on the server where hawtio is running.
     * Used just if keycloakClientConfig is not provided
     *
     * @return config to be used by default
     */
    protected String defaultKeycloakConfigLocation() {
        String karafBase = System.getProperty("karaf.base");
        if (karafBase != null) {
            return karafBase + "/etc/keycloak.json";
        }

        String jettyHome = System.getProperty("jetty.home");
        if (jettyHome != null) {
            return jettyHome + "/etc/keycloak.json";
        }

        String tomcatHome = System.getProperty("catalina.home");
        if (tomcatHome != null) {
            return tomcatHome + "/conf/keycloak.json";
        }

        String jbossHome = System.getProperty("jboss.server.config.dir");
        if (jbossHome != null) {
            return jbossHome + "/keycloak.json";
        }

        // Fallback to classpath inside hawtio.war
        return "classpath:keycloak.json";
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();
        switch (pathInfo) {
            case "/enabled":
                ServletHelpers.sendJSONResponse(response, keycloakEnabled);
                break;
            case "/client-config":
                if (keycloakConfig == null) {
                    response.sendError(404, "Keycloak client configuration not found");
                } else {
                    ServletHelpers.sendJSONResponse(response, keycloakConfig);
                }
                break;
            case "/validate-subject-matches":
                String keycloakUser = request.getParameter("keycloakUser");
                if (Strings.isBlank(keycloakUser)) {
                    LOG.warn("Parameter 'keycloakUser' not found");
                }
                boolean valid = validateKeycloakUser(request, keycloakUser);
                ServletHelpers.sendJSONResponse(response, valid);
                break;
        }
    }

    protected boolean validateKeycloakUser(HttpServletRequest request, String keycloakUser) {
        HttpSession session = request.getSession(false);

        // No session available. No existing subject logged
        if (session == null) {
            return true;
        }

        String username = (String) session.getAttribute("user");
        if (username != null && !username.equals(keycloakUser)) {
            LOG.debug("No matching username found. JAAS username: {}, keycloakUsername: {}. Invalidating session", username, keycloakUser);
            session.invalidate();
            return false;
        } else {
            return true;
        }
    }
}
