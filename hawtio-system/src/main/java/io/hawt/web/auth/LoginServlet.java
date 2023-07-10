package io.hawt.web.auth;

import java.io.IOException;
import java.io.PrintWriter;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.security.auth.Subject;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.system.AuthHelpers;
import io.hawt.system.AuthenticateResult;
import io.hawt.system.Authenticator;
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

    private static final Logger LOG = LoggerFactory.getLogger(LoginServlet.class);

    private static final String LOGIN_PAGE_PATH = "/login";

    protected int timeout;
    protected AuthenticationConfiguration authConfiguration;

    private final Converters converters = new Converters();
    private final JsonConvertOptions options = JsonConvertOptions.DEFAULT;

    private Redirector redirector = new Redirector();

    @Override
    public void init() {
        authConfiguration = AuthenticationConfiguration.getConfiguration(getServletContext());
        timeout = AuthSessionHelpers.getSessionTimeout(getServletContext());
        LOG.info("Hawtio login is using {} sec. HttpSession timeout", timeout);
    }

    /**
     * GET simply redirects to login page.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (authConfiguration.isKeycloakEnabled()) {
            redirector.doRedirect(request, response, "/");
        } else {
            redirector.doRedirect(request, response, LOGIN_PAGE_PATH);
        }
    }

    /**
     * POST with username/password tries authentication and returns result as JSON
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        AuthSessionHelpers.clear(request, authConfiguration, true);

        JSONObject json = ServletHelpers.readObject(request.getReader());
        String username = (String) json.get("username");
        String password = (String) json.get("password");

        AuthenticateResult result = new Authenticator(request, authConfiguration, username, password).authenticate(
            subject -> {
                LOG.info("Logging in user: {}", AuthHelpers.getUsername(subject));
                AuthSessionHelpers.setup(
                    request.getSession(true), subject, username, timeout);
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
