/*
 * Copyright 2024 hawt.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.web.auth;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Arrays;
import java.util.Properties;

import io.hawt.system.ConfigManager;
import io.hawt.util.IOHelper;
import io.hawt.util.Strings;
import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.keycloak.KeycloakServlet;
import io.hawt.web.auth.oidc.OidcConfiguration;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * {@link HttpServlet} that handles configuration of OIDC authentication (MS Entra ID, generic Keycloak, other
 * OpenID Connect / OAuth2 providers).
 */
public class AuthConfigurationServlet extends HttpServlet {

    private static final Logger LOG = LoggerFactory.getLogger(KeycloakServlet.class);

    public static final String OIDC_CLIENT_CONFIG = "oidcConfig";
    public static final String HAWTIO_OIDC_CLIENT_CONFIG = "hawtio." + OIDC_CLIENT_CONFIG;

    private OidcConfiguration oidcConfiguration = null;
    private boolean enabled = false;

    @Override
    public void init() throws ServletException {
        ConfigManager configManager = (ConfigManager) getServletContext().getAttribute(ConfigManager.CONFIG_MANAGER);
        if (configManager == null) {
            throw new IllegalStateException("Hawtio config manager not found, cannot proceed Hawtio configuration");
        }

        AuthenticationConfiguration authConfig = AuthenticationConfiguration.getConfiguration(getServletContext());
        if (!authConfig.isEnabled()) {
            return;
        }

        String oidcConfigFile = configManager.get(OIDC_CLIENT_CONFIG).orElse(null);

        // JVM system properties can override always
        if (System.getProperty(HAWTIO_OIDC_CLIENT_CONFIG) != null) {
            oidcConfigFile = System.getProperty(HAWTIO_OIDC_CLIENT_CONFIG);
        }

        if (Strings.isBlank(oidcConfigFile)) {
            oidcConfigFile = defaultConfigLocation();
        }

        LOG.info("Will load OIDC config from location: {}", oidcConfigFile);

        InputStream is = ServletHelpers.loadFile(oidcConfigFile);
        if (is == null) {
            LOG.info("OIDC configuration {} not found.", oidcConfigFile);
        } else {
            Properties props = new Properties();
            try {
                props.load(is);

                OidcConfiguration oc = new OidcConfiguration();
                String provider = props.getProperty("provider");
                if (Strings.isNotBlank(provider)) {
                    URL url = new URL(provider);
                    oc.setProviderURL(url);
                }
                oc.setClientId(props.getProperty("client_id"));
                oc.setResponseMode(OidcConfiguration.ResponseMode.fromString(props.getProperty("response_mode")));
                String redirectUri = props.getProperty("redirect_uri");
                if (Strings.isNotBlank(redirectUri)) {
                    URL url = new URL(redirectUri);
                    oc.setRedirectUri(url);
                }
                oc.setCodeChallengeMethod(props.getProperty("code_challenge_method"));
                String scopes = props.getProperty("scope");
                if (scopes == null) {
                    oc.setScopes(new String[0]);
                } else {
                    oc.setScopes(Arrays.stream(scopes.split("\\s+"))
                            .map(String::trim).toArray(String[]::new));
                }
                oc.setPrompt(OidcConfiguration.PromptType.fromString(props.getProperty("prompt")));

                oc.buildJSON();

                this.enabled = oc.getProviderURL() != null;
                this.oidcConfiguration = oc;
            } catch (IOException e) {
                LOG.warn("Couldn't read OIDC configuration file", e);
            } finally {
                IOHelper.close(is, "oidcInputStream", LOG);
            }
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null) {
            path = "/config";
        }
        if (path.equals("/config")) {
            if (!enabled) {
                ServletHelpers.sendJSONResponse(resp, "{}");
            } else {
                ServletHelpers.sendJSONResponse(resp, this.oidcConfiguration.toJSON());
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    /**
     * Similarly to Keycloak configuration, we'll try well-known configuration locations.
     *
     * @return config location to be used by default
     */
    protected String defaultConfigLocation() {
        String karafBase = System.getProperty("karaf.base");
        if (karafBase != null) {
            return karafBase + "/etc/hawtio-oidc.properties";
        }

        String jettyHome = System.getProperty("jetty.home");
        if (jettyHome != null) {
            return jettyHome + "/etc/hawtio-oidc.properties";
        }

        String tomcatHome = System.getProperty("catalina.home");
        if (tomcatHome != null) {
            return tomcatHome + "/conf/hawtio-oidc.properties";
        }

        String jbossHome = System.getProperty("jboss.server.config.dir");
        if (jbossHome != null) {
            return jbossHome + "/hawtio-oidc.properties";
        }

        String artemisHome = System.getProperty("artemis.instance.etc");
        if (artemisHome != null) {
            return artemisHome + "/hawtio-oidc.properties";
        }

        // Fallback to classpath inside hawtio.war
        return "classpath:hawtio-oidc.properties";
    }

}
