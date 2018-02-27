package io.hawt.web.auth.keycloak;

import java.util.concurrent.atomic.AtomicReference;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.hawt.system.AuthHelpers;
import io.hawt.system.Authenticator;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.UserServlet;

public class KeycloakUserServlet extends UserServlet {

    private boolean keycloakEnabled;

    @Override
    public void init() throws ServletException {
        super.init();
        keycloakEnabled = KeycloakHelper.isKeycloakEnabled(config);
    }

    @Override
    protected String getUsername(HttpServletRequest req, HttpServletResponse resp) {
        if (keycloakEnabled) {
            return getKeycloakUsername(req, resp);
        } else {
            return super.getUsername(req, resp);
        }
    }

    /**
     * With Keycloak integration, the Authorization header is available in the request to the UserServlet.
     */
    protected String getKeycloakUsername(final HttpServletRequest req, HttpServletResponse resp) {
        AuthenticationConfiguration configuration = AuthenticationConfiguration.getConfiguration(getServletContext());

        AtomicReference<String> username = new AtomicReference<>();
        Authenticator.authenticate(
            configuration, req,
            subject -> {
                username.set(AuthHelpers.getUsername(subject));

                // Start httpSession
                req.getSession(true);
            }
        );
        return username.get();
    }


}
