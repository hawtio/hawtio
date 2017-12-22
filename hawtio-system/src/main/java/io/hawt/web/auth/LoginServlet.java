package io.hawt.web.auth;

import java.io.IOException;
import java.util.GregorianCalendar;
import javax.security.auth.Subject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import io.hawt.system.Authenticator;
import io.hawt.system.ConfigManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Login servlet
 */
public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final transient Logger LOG = LoggerFactory.getLogger(LoginServlet.class);
    private static final int DEFAULT_SESSION_TIMEOUT = 1800;

    private Integer timeout = DEFAULT_SESSION_TIMEOUT;
    private AuthenticationConfiguration authenticationConfiguration;
    private BrandingService brandingService;

    @Override
    public void init() throws ServletException {
        ConfigManager configManager = (ConfigManager) getServletContext().getAttribute("ConfigManager");
        if (configManager != null) {
            String s = configManager.get("sessionTimeout", "" + DEFAULT_SESSION_TIMEOUT);
            if (s != null) {
                try {
                    timeout = Integer.parseInt(s);
                    // timeout of 0 means default timeout
                    if (timeout == 0) {
                        timeout = DEFAULT_SESSION_TIMEOUT;
                    }
                } catch (Exception e) {
                    // ignore and use our own default of 1/2 hour
                    timeout = DEFAULT_SESSION_TIMEOUT;
                }
            }
        }

        authenticationConfiguration = ConfigurationManager.getConfiguration(getServletContext());

        brandingService = new BrandingService(getServletContext());

        LOG.info("hawtio login is using " + (timeout != null ? timeout + " sec." : "default") + " HttpSession timeout");

    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        forwardToLoginPage(req, resp, "", false);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String username = req.getParameter("username");
        String password = req.getParameter("password");

        Subject subject = Authenticator.doAuthenticate(
            authenticationConfiguration.getRealm(),
            authenticationConfiguration.getRole(),
            authenticationConfiguration.getRolePrincipalClasses(),
            authenticationConfiguration.getConfiguration(),
            username,
            password);

        if (subject == null) {
            forwardToLoginPage(req, resp, username, true);
            return;
        }

        HttpSession session = req.getSession(true);
        session.setAttribute("subject", subject);
        session.setAttribute("user", username);
        session.setAttribute("org.osgi.service.http.authentication.remote.user", username);
        session.setAttribute("org.osgi.service.http.authentication.type", HttpServletRequest.BASIC_AUTH);
        session.setAttribute("loginTime", GregorianCalendar.getInstance().getTimeInMillis());
        if (timeout != null) {
            session.setMaxInactiveInterval(timeout);
        }
        if (LOG.isDebugEnabled()) {
            LOG.debug("Http session timeout for user {} is {} sec.", username, session.getMaxInactiveInterval());
        }

        resp.sendRedirect(req.getContextPath());
    }

    private void forwardToLoginPage(HttpServletRequest req, HttpServletResponse resp, String username,
                                    boolean wrongPassword) throws ServletException, IOException {
        req.setAttribute("appName", brandingService.getProperty("appName"));
        req.setAttribute("appType", brandingService.getProperty("appType"));
        req.setAttribute("appLogoUrl", brandingService.getProperty("appLogoUrl"));
        req.setAttribute("companyLogoUrl", brandingService.getProperty("companyLogoUrl"));
        req.setAttribute("username", username);
        req.setAttribute("wrong_password", wrongPassword);
        req.getRequestDispatcher("/login.jsp").forward(req, resp);
    }
}
