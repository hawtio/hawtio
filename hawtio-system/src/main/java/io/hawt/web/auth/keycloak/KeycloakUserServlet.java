package io.hawt.web.auth.keycloak;

import java.util.concurrent.atomic.AtomicReference;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.system.AuthHelpers;
import io.hawt.system.Authenticator;
import io.hawt.web.auth.UserServlet;

public class KeycloakUserServlet extends UserServlet {

    private static final long serialVersionUID = 1734127369954899957L;

    @Override
    public void init() throws ServletException {
        super.init();
    }

    @Override
    protected String getUsername(HttpServletRequest req, HttpServletResponse resp) {
        String username = null;
        boolean keycloakEnabled = authConfiguration.isKeycloakEnabled();
        if (keycloakEnabled) {
            username = getKeycloakUsername(req);
        }
        if (!keycloakEnabled || username == null) {
            // special case when there are more login modules configured
            username = super.getUsername(req, resp);
        }
        return username;
    }

    /**
     * With Keycloak integration, the Authorization header is available in the request to the UserServlet.
     */
    protected String getKeycloakUsername(final HttpServletRequest req) {
        AtomicReference<String> username = new AtomicReference<>();
        new Authenticator(req, authConfiguration).authenticate(
            subject -> {
                username.set(AuthHelpers.getUsername(authConfiguration, subject));

                // Start httpSession
                req.getSession(true);
            }
        );
        return username.get();
    }

}
