package io.hawt.web.auth;

import java.io.IOException;
import java.io.PrintWriter;
import java.security.Principal;
import java.util.ArrayList;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.security.auth.Subject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import io.hawt.system.AuthHelpers;
import io.hawt.system.AuthenticateResult;
import io.hawt.system.Authenticator;
import io.hawt.system.ConfigManager;
import io.hawt.web.ServletHelpers;
import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Login servlet
 */
public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 187076436862364207L;

    private static final transient Logger LOG = LoggerFactory.getLogger(LoginServlet.class);
    private static final int DEFAULT_SESSION_TIMEOUT = 1800; // 30 mins

    private Integer timeout = DEFAULT_SESSION_TIMEOUT;
    private AuthenticationConfiguration authConfiguration;

    private Converters converters = new Converters();
    private JsonConvertOptions options = JsonConvertOptions.DEFAULT;

    private Redirector redirector = new Redirector();

    @Override
    public void init() {
        authConfiguration = AuthenticationConfiguration.getConfiguration(getServletContext());
        setupSessionTimeout();
        LOG.info("hawtio login is using {} HttpSession timeout", timeout != null ? timeout + " sec." : "default");
    }

    private void setupSessionTimeout() {
        ConfigManager configManager = (ConfigManager) getServletContext().getAttribute(ConfigManager.CONFIG_MANAGER);
        if (configManager == null) {
            return;
        }
        String timeoutStr = configManager.get("sessionTimeout", Integer.toString(DEFAULT_SESSION_TIMEOUT));
        if (timeoutStr == null) {
            return;
        }
        try {
            timeout = Integer.valueOf(timeoutStr);
            // timeout of 0 means default timeout
            if (timeout == 0) {
                timeout = DEFAULT_SESSION_TIMEOUT;
            }
        } catch (Exception e) {
            // ignore and use our own default of 1/2 hour
            timeout = DEFAULT_SESSION_TIMEOUT;
        }
    }

    /**
     * GET simply returns login.html
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (authConfiguration.isKeycloakEnabled()) {
            redirector.doRedirect(request, response, "/");
        } else {
            redirector.doForward(request, response, "/login.html");
        }
    }

    /**
     * POST with username/password tries authentication and returns result as JSON
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        clearSession(request);

        JSONObject json = ServletHelpers.readObject(request.getReader());
        String username = (String) json.get("username");
        String password = (String) json.get("password");

        AuthenticateResult result = Authenticator.authenticate(
            authConfiguration, request, username, password,
            subject -> {
                LOG.info("Logging in user: {}", AuthHelpers.getUsername(subject));
                setupSession(request, subject, username);
                sendResponse(response, subject);
            });

        switch (result) {
            case AUTHORIZED:
                // response was sent using the authenticated subject, nothing more to do
                break;
            case NOT_AUTHORIZED:
            case NO_CREDENTIALS:
                ServletHelpers.doForbidden(response);
                break;
        }
    }

    private void clearSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return;
        }
        Subject subject = (Subject) session.getAttribute("subject");
        if (subject != null) {
            LOG.info("Logging out existing user: {}", AuthHelpers.getUsername(subject));
            Authenticator.logout(authConfiguration, subject);
            session.invalidate();
        }
    }

    private void setupSession(HttpServletRequest request, Subject subject, String username) {
        HttpSession session = request.getSession(true);
        session.setAttribute("subject", subject);
        session.setAttribute("user", username);
        session.setAttribute("org.osgi.service.http.authentication.remote.user", username);
        session.setAttribute("org.osgi.service.http.authentication.type", HttpServletRequest.BASIC_AUTH);
        session.setAttribute("loginTime", GregorianCalendar.getInstance().getTimeInMillis());
        if (timeout != null) {
            session.setMaxInactiveInterval(timeout);
        }
        LOG.debug("Http session timeout for user {} is {} sec.", username, session.getMaxInactiveInterval());
    }

    private void sendResponse(HttpServletResponse response, Subject subject) {
        response.setContentType("application/json");
        try (PrintWriter out = response.getWriter()) {
            Map<String, Object> answer = new HashMap<>();

            List<Object> principals = new ArrayList<>();
            for (Principal principal : subject.getPrincipals()) {
                Map<String, String> data = new HashMap<>();
                data.put("type", principal.getClass().getName());
                data.put("name", principal.getName());
                principals.add(data);
            }

            List<Object> credentials = new ArrayList<>();
            for (Object credential : subject.getPublicCredentials()) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", credential.getClass().getName());
                data.put("credential", credential);
                credentials.add(data);
            }

            answer.put("principals", principals);
            answer.put("credentials", credentials);

            ServletHelpers.writeObject(converters, options, out, answer);
        } catch (IOException e) {
            LOG.error("Failed to send response", e);
        }
    }

    public void setRedirector(Redirector redirector) {
        this.redirector = redirector;
    }
}
