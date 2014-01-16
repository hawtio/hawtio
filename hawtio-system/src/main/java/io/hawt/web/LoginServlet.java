package io.hawt.web;

import java.io.IOException;
import java.io.PrintWriter;
import java.security.AccessControlContext;
import java.security.AccessController;
import java.security.Principal;
import java.util.ArrayList;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.security.auth.Subject;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import io.hawt.system.ConfigManager;
import io.hawt.system.Helpers;
import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 */
public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final transient Logger LOG = LoggerFactory.getLogger(LoginServlet.class);

    Converters converters = new Converters();
    JsonConvertOptions options = JsonConvertOptions.DEFAULT;
    ConfigManager config;
    private Integer timeout;

    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        config = (ConfigManager) servletConfig.getServletContext().getAttribute("ConfigManager");
        if (config != null) {
            String s = config.get("sessionTimeout", null);
            if (s != null) {
                try {
                    timeout = Integer.parseInt(s);
                    // timeout of 0 means default timeout
                    if (timeout == 0) {
                        timeout = null;
                    }
                } catch (Exception e) {
                    // ignore and use default timeout value
                }
            }
        }

        LOG.info("hawtio login is using " + (timeout != null ? timeout + " sec." : "default") + " HttpSession timeout");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        resp.setContentType("application/json");
        final PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);

        if (session != null) {
            Subject subject = (Subject) session.getAttribute("subject");
            if (subject == null) {
                LOG.warn("No security subject stored in existing session, invalidating");
                session.invalidate();
                Helpers.doForbidden(resp);
            }
            returnPrincipals(subject, out);
            return;
        }

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
                    LOG.debug("Authorizing user {}", username);
                }
            }
        }

        session = req.getSession(true);
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

        returnPrincipals(subject, out);
    }

    private void returnPrincipals(Subject subject, PrintWriter out) {

        Map<String, Object> answer = new HashMap<String, Object>();

        List<Object> principals = new ArrayList<Object>();

        for (Principal principal : subject.getPrincipals()) {
            Map<String, String> data = new HashMap<String, String>();
            data.put("type", principal.getClass().getName());
            data.put("name", principal.getName());
            principals.add(data);
        }

        List<Object> credentials = new ArrayList<Object>();
        for (Object credential : subject.getPublicCredentials()) {
            Map<String, Object> data = new HashMap<String, Object>();
            data.put("type", credential.getClass().getName());
            data.put("credential", credential);
        }

        answer.put("principals", principals);
        answer.put("credentials", credentials);

        ServletHelpers.writeObject(converters, options, out, answer);
    }

}
