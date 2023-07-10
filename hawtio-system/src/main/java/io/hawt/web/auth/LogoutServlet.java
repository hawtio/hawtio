package io.hawt.web.auth;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Logout servlet
 */
public class LogoutServlet extends HttpServlet {

    private static final long serialVersionUID = -3504832582691232812L;

    private static final Logger LOG = LoggerFactory.getLogger(LogoutServlet.class);

    protected AuthenticationConfiguration authConfiguration;

    protected Redirector redirector = new Redirector();

    @Override
    public void init() {
        authConfiguration = AuthenticationConfiguration.getConfiguration(getServletContext());
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.logout();
        if (AuthSessionHelpers.isSpringSecurityEnabled()) {
            AuthSessionHelpers.clear(request, authConfiguration, false);
            redirector.doRedirect(request, response, "/");
        } else {
            AuthSessionHelpers.clear(request, authConfiguration, true);
            redirector.doRedirect(request, response, AuthenticationConfiguration.LOGIN_URL);
        }
    }

    public void setRedirector(Redirector redirector) {
        this.redirector = redirector;
    }
}
