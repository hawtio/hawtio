package io.hawt.web.auth;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import io.hawt.web.ServletHelpers;

/**
 * Returns the username associated with the current session, if any
 */
public class UserServlet extends HttpServlet {

    private static final long serialVersionUID = -1239510748236245667L;
    private static final String DEFAULT_USER = "public";

    protected AuthenticationConfiguration authConfiguration;

    @Override
    public void init() throws ServletException {
        authConfiguration = AuthenticationConfiguration.getConfiguration(getServletContext());
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!authConfiguration.isEnabled()) {
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
        // For Spring Security
        if (authConfiguration.isSpringSecurityEnabled()) {
            return request.getRemoteUser();
        }

        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }

        return (String) session.getAttribute("user");
    }
}
