package io.hawt.web;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import io.hawt.system.ConfigManager;

/**
 * Returns the username associated with the current session, if any
 */
public class UserServlet extends HttpServlet {

    protected ConfigManager config;
    private boolean authenticationEnabled = true;

    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        config = (ConfigManager) servletConfig.getServletContext().getAttribute("ConfigManager");
        if (config != null) {
            this.authenticationEnabled = Boolean.parseBoolean(config.get("authenticationEnabled", "true"));
        }

        // JVM system properties can override always
        if (System.getProperty(AuthenticationFilter.HAWTIO_AUTHENTICATION_ENABLED) != null) {
            this.authenticationEnabled = Boolean.getBoolean(AuthenticationFilter.HAWTIO_AUTHENTICATION_ENABLED);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        final PrintWriter out = resp.getWriter();

        if (!authenticationEnabled) {
            out.write("\"user\"");
            out.flush();
            out.close();
            return;
        }

        HttpSession session = req.getSession(false);

        if (session != null) {
            String username = (String) session.getAttribute("user");
            out.write("\"" + username + "\"");
        } else {
            out.write("");
        }
        out.flush();
        out.close();
    }
}
