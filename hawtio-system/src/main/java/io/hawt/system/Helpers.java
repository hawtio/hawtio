package io.hawt.system;

import java.io.IOException;
import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Helpers {

    private static final transient Logger LOG = LoggerFactory.getLogger(Helpers.class);

    public static final List<String> KNOWN_PRINCIPALS = Arrays.asList(
        "UserPrincipal", "KeycloakPrincipal", "JAASPrincipal", "SimplePrincipal");

    private static final String HEADER_WWW_AUTHENTICATE = "WWW-Authenticate";

    public static void doForbidden(HttpServletResponse response) {
        try {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentLength(0);
            response.flushBuffer();
        } catch (IOException ioe) {
            LOG.debug("Failed to send forbidden response: {}", ioe);
        }
    }

    public static void doAuthPrompt(String realm, HttpServletResponse response) {
        // request authentication
        try {
            response.setHeader(HEADER_WWW_AUTHENTICATE, Authenticator.AUTHENTICATION_SCHEME_BASIC + " realm=\"" + realm + "\"");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentLength(0);
            response.flushBuffer();
        } catch (IOException ioe) {
            LOG.debug("Failed to send auth response: {}", ioe);
        }

    }

    public static String getUsernameFromSubject(Subject subject) {
        Set<Principal> principals = subject.getPrincipals();

        String username = null;

        if (principals != null) {
            for (Principal principal : principals) {
                String principalClass = principal.getClass().getSimpleName();
                if (KNOWN_PRINCIPALS.contains(principalClass)) {
                    username = principal.getName();
                    LOG.debug("Authorizing user {}", username);
                }
            }
        }

        return username;
    }

}
