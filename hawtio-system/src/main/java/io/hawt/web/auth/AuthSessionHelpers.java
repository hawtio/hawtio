package io.hawt.web.auth;

import java.util.GregorianCalendar;
import java.util.concurrent.atomic.AtomicReference;

import javax.security.auth.Subject;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import io.hawt.system.Authenticator;
import io.hawt.system.ConfigManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Helpers for authentication and authorization on HTTP sessions.
 */
public final class AuthSessionHelpers {

    private static final transient Logger LOG = LoggerFactory.getLogger(AuthSessionHelpers.class);

    public static final int DEFAULT_SESSION_TIMEOUT = 1800; // 30 mins

    private AuthSessionHelpers() {
        // utility class
    }

    public static int getSessionTimeout(ServletContext context) {
        int timeout = DEFAULT_SESSION_TIMEOUT;
        ConfigManager configManager = (ConfigManager) context.getAttribute(ConfigManager.CONFIG_MANAGER);
        if (configManager == null) {
            return timeout;
        }
        String timeoutStr = configManager.get("sessionTimeout", Integer.toString(DEFAULT_SESSION_TIMEOUT));
        if (timeoutStr == null) {
            return timeout;
        }
        try {
            timeout = Integer.parseInt(timeoutStr);
            // timeout of 0 means default timeout
            if (timeout == 0) {
                timeout = DEFAULT_SESSION_TIMEOUT;
            }
        } catch (Exception e) {
            // ignore and use our own default of 1/2 hour
            timeout = DEFAULT_SESSION_TIMEOUT;
        }
        return timeout;
    }

    public static void clear(HttpServletRequest request, AuthenticationConfiguration authConfig,
                             boolean authenticatorLogout) {
        HttpSession session = request.getSession(false);
        if (!isAuthenticated(session)) {
            return;
        }
        Subject subject = (Subject) session.getAttribute("subject");
        LOG.info("Logging out existing user: {}", session.getAttribute("user"));
        if (authenticatorLogout) {
            Authenticator.logout(authConfig, subject);
        }
        session.invalidate();
    }

    public static void setup(HttpSession session, Subject subject, String username, int timeout) {
        session.setAttribute("subject", subject);
        session.setAttribute("user", username);
        session.setAttribute("org.osgi.service.http.authentication.remote.user", username);
        session.setAttribute("org.osgi.service.http.authentication.type", HttpServletRequest.BASIC_AUTH);
        session.setAttribute("loginTime", GregorianCalendar.getInstance().getTimeInMillis());
        session.setMaxInactiveInterval(timeout);
        LOG.debug("Http session timeout for user {} is {} sec.", username, session.getMaxInactiveInterval());
    }

    public static boolean validate(HttpServletRequest request, HttpSession session, Subject subject) {
        if (session == null || subject == null) {
            return false;
        }
        String sessionUser = (String) session.getAttribute("user");
        AtomicReference<String> username = new AtomicReference<>();
        AtomicReference<String> password = new AtomicReference<>();
        Authenticator.extractAuthHeader(request, (u, p) -> {
            username.set(u);
            password.set(p);
        });
        if (username.get() == null || username.get().equals(sessionUser)) {
            LOG.debug("Session subject - {}", subject);
            return true;
        } else {
            LOG.debug("User differs, re-authenticating: {} (request) != {} (session)", username.get(), sessionUser);
            session.invalidate();
            return false;
        }
    }

    public static boolean isAuthenticated(HttpSession session) {
        return session != null && session.getAttribute("subject") != null;
    }

    public static boolean isSpringSecurityEnabled() {
        try {
            Class.forName("org.springframework.security.core.SpringSecurityCoreVersion");
            return true;
        } catch (ClassNotFoundException e) {
            return false;
        }
    }

}
