package io.hawt.web.auth;

import io.hawt.web.ServletHelpers;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.jolokia.json.JSONWriter;

import java.io.IOException;
import java.io.StringWriter;

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
            ServletHelpers.sendJSONResponse(response, toJsonString(DEFAULT_USER));
            return;
        }

        String username = getUsername(request, response);

        if (username == null) {
            ServletHelpers.doForbidden(response);
            return;
        }
        ServletHelpers.sendJSONResponse(response, toJsonString(username));
    }

    private String toJsonString(String str) throws IOException {
        var json = new StringWriter();
        JSONWriter.serialize(str, json);
        return json.toString();
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
