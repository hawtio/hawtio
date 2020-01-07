package io.hawt.web.auth;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Logout servlet
 */
public class LogoutServlet extends HttpServlet {

    private static final long serialVersionUID = -3504832582691232812L;

    private static final transient Logger LOG = LoggerFactory.getLogger(LogoutServlet.class);

    private AuthenticationConfiguration authConfiguration;

    private Redirector redirector = new Redirector();

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
