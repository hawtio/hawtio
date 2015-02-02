package io.hawt.web.keycloak;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import io.hawt.system.ConfigManager;
import io.hawt.util.IOHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Servlet, which aims to return:
 * - whether keycloak is enabled (true/false) if path '/enabled' is used
 * - keycloak.json to be used by keycloak JS adapter on frontend if path '/client-config' is used
 * - validate if current JAAS logged subject is same like SSO user logged through keycloak if path '/validate-subject-matches' is used
 *
 */
public class KeycloakServlet extends HttpServlet {

    private static final transient Logger LOG = LoggerFactory.getLogger(KeycloakServlet.class);

    public static final String KEYCLOAK_CLIENT_CONFIG = "keycloakClientConfig";
    public static final String KEYCLOAK_ENABLED = "keycloakEnabled";

    public static final String HAWTIO_KEYCLOAK_CLIENT_CONFIG = "hawtio." + KEYCLOAK_CLIENT_CONFIG;
    public static final String HAWTIO_KEYCLOAK_ENABLED = "hawtio." + KEYCLOAK_ENABLED;

    private String keycloakConfig = null;
    private boolean keycloakEnabled;


    @Override
    public void init() throws ServletException {
        ConfigManager config = (ConfigManager) getServletContext().getAttribute("ConfigManager");

        String keycloakEnabledCfg = config.get(KEYCLOAK_ENABLED, "false");
        String keycloakConfigFile = config.get(KEYCLOAK_CLIENT_CONFIG, null);

        // JVM system properties can override always
        if (System.getProperty(HAWTIO_KEYCLOAK_ENABLED) != null) {
            keycloakEnabledCfg = System.getProperty(HAWTIO_KEYCLOAK_ENABLED);
        }
        if (System.getProperty(HAWTIO_KEYCLOAK_CLIENT_CONFIG) != null) {
            keycloakConfigFile = System.getProperty(HAWTIO_KEYCLOAK_CLIENT_CONFIG);
        }

        keycloakEnabled = Boolean.parseBoolean(keycloakEnabledCfg);
        LOG.info("Keycloak integration is " + (this.keycloakEnabled ? "enabled" : "disabled"));
        if (!keycloakEnabled) {
            return;
        }

        if (keycloakConfigFile == null || keycloakConfigFile.length() == 0) {
            keycloakConfigFile = defaultKeycloakConfigLocation();
        }

        LOG.info("Will load keycloak config from location: " + keycloakConfigFile);

        InputStream is = loadFile(keycloakConfigFile);
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
     * Will try to guess the config location based on the server where hawtio is running. Used just if keycloakClientConfig is not provided
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

    protected InputStream loadFile(String keycloakConfigFile) {
        if (keycloakConfigFile.startsWith("classpath:")) {
            String classPathLocation = keycloakConfigFile.substring(10);
            return getClass().getClassLoader().getResourceAsStream(classPathLocation);
        } else {
            try {
                return new FileInputStream(keycloakConfigFile);
            } catch (FileNotFoundException fnfe) {
                LOG.warn("Couldn't find keycloak config file on location: " + keycloakConfigFile);
                return null;
            }
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        if ("/enabled".equals(pathInfo)) {
            renderJSONResponse(response, String.valueOf(keycloakEnabled));
        } else if ("/client-config".equals(pathInfo)) {
            if (keycloakConfig == null) {
                response.sendError(404, "Keycloak client configuration not found");
            } else {
                renderJSONResponse(response, keycloakConfig);
            }
        } else if ("/validate-subject-matches".equals(pathInfo)) {
            String keycloakUser = request.getParameter("keycloakUser");
            if (keycloakUser == null || keycloakUser.length() == 0) {
                LOG.warn("Parameter 'keycloakUser' not found");
            }
            boolean valid = validateKeycloakUser(request, keycloakUser);
            renderJSONResponse(response, String.valueOf(valid));
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
            LOG.debug("Non matching username found. JAAS username: " + username + ", keycloakUsername: " + keycloakUser + ". Invalidating session");
            session.invalidate();
            return false;
        } else {
            return true;
        }
    }

    private void renderJSONResponse(HttpServletResponse response, String text) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter writer = response.getWriter();
        writer.println(text);
        writer.flush();
        writer.close();
    }
}
