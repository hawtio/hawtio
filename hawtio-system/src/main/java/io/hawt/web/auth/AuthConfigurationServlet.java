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

import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.oidc.OidcConfiguration;
import io.hawt.web.servlets.ConfigurationServlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jolokia.json.JSONArray;
import org.jolokia.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>{@link HttpServlet} that handles configuration of supported authentication methods, OIDC authentication
 * (MS Entra ID, generic Keycloak, other OpenID Connect / OAuth2 providers) and session parameters.</p>
 *
 * <p>Hawtio maps this servlet to {@code /auth/config/*}, so {@link HttpServletRequest#getPathInfo()}} is what
 * describes the operation we want to perform on this servlet:<ul>
 *     <li>empty (when user just hits {@code /auth/config} or {@code /auth/config/} or {@code /auth/config///} or
 *     {@code login} - return login information - supported authentication methods</li>
 *     <li>{@code session-timeout} - return information about session timeout</li>
 *     <li>{@code oidc} - return information about OpenID Connect provider details.</li>
 * </ul></p>
 */
public class AuthConfigurationServlet extends ConfigurationServlet {

    private static final Logger LOG = LoggerFactory.getLogger(AuthConfigurationServlet.class);

    // path needed to prepare absolute (host:port relative) links to login page
    // this path is "/" in WAR deployment, but could be different in Spring Boot. We need to pass proper
    // "base" because it can't be determined otherwise using request.getContextPath() and request.getServletPath()
    private String hawtioPath;

    private boolean keycloakEnabled = false;

    private OidcConfiguration oidcConfiguration = null;
    private boolean oidcEnabled = false;

    private final JSONArray authMethods = new JSONArray();


    public AuthConfigurationServlet() {
    }

    public AuthConfigurationServlet(String hawtioPath) {
        this.hawtioPath = hawtioPath;
    }

    @Override
    protected String getDefaultPath() {
        return "login";
    }

    @Override
    public void init() throws ServletException {
        super.init();

        if (hawtioPath == null) {
            // we have to determine it from Servlet environment
            hawtioPath = getServletContext().getContextPath();
        }

        keycloakEnabled = authConfiguration.isKeycloakEnabled();

        oidcEnabled = authConfiguration.isOidcEnabled();
        LOG.info("OpenID Connection integration is {}", oidcEnabled ? "enabled" : "disabled");
        if (oidcEnabled) {
            oidcConfiguration = authConfiguration.getOidcConfiguration();
        }

        // this servlet also shows general configuration (supported authentication methods), so we need some
        // cleverness here

        // -Dhawtio.authenticationEnabled
        boolean authEnabled = authConfiguration.isEnabled();
        // when disabled, we don't return any supported authentication methods
        if (authEnabled) {
            // OIDC - configured with hawtio-oidc.properties on CLASSPATH and programmatic (no login.conf)
            // usag of io.hawt.web.auth.oidc.OidcLoginModule
            if (oidcEnabled) {
                JSONObject entry = new JSONObject();
                entry.put("method", "oidc");
                entry.put("name", oidcConfiguration.getName());
                authMethods.add(entry);
            }

            // Keycloak native is configured with explicit -Dhawtio.keycloakEnabled=true,
            // pointing to keycloak.json and using Keycloak own org.keycloak.adapters.jaas.BearerTokenLoginModule
            if (keycloakEnabled) {
                JSONObject entry = new JSONObject();
                entry.put("method", "keycloak");
                entry.put("name", "Keycloak");
                authMethods.add(entry);
            }

            if (authConfiguration.isSpringSecurityEnabled()) {
                // Spring Security may configure various auth mechanisms (yes - including typical form
                // authentication or HTTP Basic authentication), but we really don't know what could it be,
                // so we register special "external" authentication mechanism, which should be effectively
                // ignored in @hawtio/react.
                // Such authentication mechanism will run even before user sees /hawtio/index.html anyway
                // by some login redirect mechanism
                JSONObject entry = new JSONObject();
                entry.put("method", "external");
                entry.put("name", "Spring Security");
                authMethods.add(entry);
            } else {
                // no Spring security, but Hawtio/WAR and Hawtio/Quarkus will use (respectively):
                //  - io.hawt.web.auth.LoginServlet
                //  - io.hawt.quarkus.servlets.HawtioQuakusLoginServlet
                // which means proper form authentication
                String basePath = ServletHelpers.webContextPath(hawtioPath);
                JSONObject entry = new JSONObject();
                entry.put("method", "form");
                entry.put("name", "User credentials");
                entry.put("type", "json");
                // should match what we have in web.xml
                entry.put("url", basePath + "/auth/login");
                entry.put("logoutUrl", basePath + "/auth/logout");
                entry.put("userField", "username");
                entry.put("passwordField", "password");
                authMethods.add(entry);
            }

            // basic auth detection is not supported as login method to Hawtio itself
        }
    }

    @Override
    protected void handleGet(String path, HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // now we can check by the "verb" or operation type - first URL segment after mapped servlet path
        switch (path) {
            case "oidc":
                // OIDC configuration to be used at client side (where OIDC authentication flow will start)
                ServletHelpers.sendJSONResponse(resp, oidcEnabled ? this.oidcConfiguration.toJSON() : "{}");
                break;
            case "session-timeout":
                // req - timestamp sent from the requesting side - if you send non-numeric, we assume the
                //       same client and server time
                // now - timestamp now at server-side
                // timeout - sessionTimeout in seconds from webapp session
                String t = req.getParameter("t");
                long now = System.currentTimeMillis();
                long v;
                try {
                    v = Long.parseLong(t);
                } catch (NumberFormatException e) {
                    v = now;
                }
                String config = String.format("{\"req\":%d,\"now\":%d,\"timeout\":%d}", v, now,
                        AuthSessionHelpers.getSessionTimeout(getServletContext()));
                ServletHelpers.sendJSONResponse(resp, config);
                break;
            case "login":
                // configuration of available Hawtio login methods - determined from various parameters
                // and depending on the deployment method (WAR, Spring, Quarkus)
                // this is used by @hawtio/react to configure login method selection screen
                ServletHelpers.sendJSONResponse(resp, authMethods.toJSONString());
                break;
            default:
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

}
