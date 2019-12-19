package io.hawt.web.auth;

import java.util.GregorianCalendar;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import io.hawt.system.AuthHelpers;
import io.hawt.system.AuthInfo;
import io.hawt.system.Authenticator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Helpers for authentication and authorization on HTTP sessions.
 */
public final class AuthSessionHelpers {

    private static final transient Logger LOG = LoggerFactory.getLogger(AuthSessionHelpers.class);

    private AuthSessionHelpers() {
        // utility class
    }

    public static void clear(HttpServletRequest request, AuthenticationConfiguration authConfig) {
        HttpSession session = request.getSession(false);
        if (!isAuthenticated(session)) {
            return;
        }
        Subject subject = (Subject) session.getAttribute("subject");
        LOG.info("Logging out existing user: {}", AuthHelpers.getUsername(subject));
        Authenticator.logout(authConfig, subject);
        session.invalidate();
    }

    public static void setup(HttpServletRequest request, Subject subject, String username, int timeout) {
        HttpSession session = request.getSession(true);
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
        AuthInfo info = Authenticator.getAuthorizationHeader(request);
        String sessionUser = (String) session.getAttribute("user");
        if (info.username == null || info.username.equals(sessionUser)) {
            LOG.debug("Session subject - {}", subject);
            return true;
        } else {
            LOG.debug("User differs, re-authenticating: {} (request) != {} (session)", info.username, sessionUser);
            session.invalidate();
            return false;
        }
    }

    public static boolean isAuthenticated(HttpSession session) {
        return session != null && session.getAttribute("subject") != null;
    }

}
