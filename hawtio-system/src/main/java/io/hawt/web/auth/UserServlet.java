package io.hawt.web.auth;

import java.io.IOException;
import java.io.Serial;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import io.hawt.system.ConfigManager;
import io.hawt.web.ServletHelpers;

import static io.hawt.web.auth.AuthenticationConfiguration.AUTHENTICATION_ENABLED;

/**
 * Returns the username associated with the current session, if any
 */
public class UserServlet extends HttpServlet {

    @Serial
    private static final long serialVersionUID = -1239510748236245667L;
    private static final String DEFAULT_USER = "public";

    protected ConfigManager config;
    private boolean authenticationEnabled = true;

    @Override
    public void init() throws ServletException {
        config = (ConfigManager) getServletConfig().getServletContext().getAttribute(ConfigManager.CONFIG_MANAGER);
        if (config == null) {
            throw new ServletException("Hawtio config manager not found, cannot initialise servlet");
        }
        authenticationEnabled = config.getBoolean(AUTHENTICATION_ENABLED, true);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!authenticationEnabled) {
            ServletHelpers.sendJSONResponse(response, wrapQuote(DEFAULT_USER));
            return;
        }

        String username = getUsername(request, response);
        if (username == null) {
            ServletHelpers.doForbidden(response);
            return;
        }
        ServletHelpers.sendJSONResponse(response, wrapQuote(username));
    }

    private String wrapQuote(String str) {
        return "\"" + str + "\"";
    }

    protected String getUsername(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }

        // For Spring Security
        if (AuthSessionHelpers.isSpringSecurityEnabled()) {
            return request.getRemoteUser();
        }

        return (String) session.getAttribute("user");
    }
}
