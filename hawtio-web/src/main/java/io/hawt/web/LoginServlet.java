package io.hawt.web;

import io.hawt.system.Helpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.security.auth.Subject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.security.AccessControlContext;
import java.security.AccessController;
import java.security.Principal;
import java.util.GregorianCalendar;
import java.util.Set;

/**
 * @author Stan Lewis
 */
public class LoginServlet extends HttpServlet {

    private static final transient Logger LOG = LoggerFactory.getLogger(LoginServlet.class);

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        AccessControlContext acc = AccessController.getContext();
        Subject subject = Subject.getSubject(acc);

        if (subject == null) {
            Helpers.doForbidden(resp);
            return;
        }
        Set<Principal> principals = subject.getPrincipals();

        String username = null;

        if (principals != null) {
            for (Principal principal : principals) {
                if (principal.getClass().getSimpleName().equals("UserPrincipal")) {
                    username = principal.getName();
                    LOG.info("Authorizing user " + username);
                }
            }
        }

        HttpSession session = req.getSession(true);
        session.setAttribute("subject", subject);
        session.setAttribute("user", username);
        session.setAttribute("org.osgi.service.http.authentication.remote.user", username);
        session.setAttribute("org.osgi.service.http.authentication.type", HttpServletRequest.BASIC_AUTH);
        session.setAttribute("loginTime", GregorianCalendar.getInstance().getTimeInMillis());
        session.setMaxInactiveInterval(900);
    }

}
