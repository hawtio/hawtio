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

import io.hawt.system.ConfigManager;
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

        oidcConfiguration = authConfig.getOidcConfiguration();
        enabled = oidcConfiguration != null && oidcConfiguration.isEnabled();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null || path.trim().isEmpty() || "/".equals(path.trim())) {
            path = "/config";
        }
        if (path.equals("/config")) {
            if (!enabled) {
                ServletHelpers.sendJSONResponse(resp, "{}");
            } else {
                ServletHelpers.sendJSONResponse(resp, this.oidcConfiguration.toJSON());
            }
        } else if (path.equals("/session-timeout")) {
            // req - timestamp sent from the requesting side - if you send non-numeric, you'll get a JSON error
            // now - timestamp now at server-side
            // timeout - sessionTimeout in seconds from webapp session
            String t = req.getParameter("t");
            long v;
            try {
                v = Long.parseLong(t);
            } catch (NumberFormatException e) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            String config = String.format("{\"req\":%d,\"now\":%d,\"timeout\":%d}",
                    v, System.currentTimeMillis(),
                    AuthSessionHelpers.getSessionTimeout(getServletContext()));
            ServletHelpers.sendJSONResponse(resp, config);
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

}
