package io.hawt.system;

import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.security.auth.Subject;
import javax.security.auth.callback.*;
import javax.security.auth.login.AccountException;
import javax.security.auth.login.FailedLoginException;
import javax.security.auth.login.LoginContext;
import javax.security.auth.login.LoginException;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.Principal;

/**
 * @author Stan Lewis
 */
public class Authenticator {

    private static final transient Logger LOG = LoggerFactory.getLogger(Authenticator.class);

    private static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String AUTHENTICATION_SCHEME_BASIC = "Basic";

    public static boolean authenticate(String realm, String role, HttpServletRequest request) {

        String authHeader = request.getHeader(HEADER_AUTHORIZATION);

        if (authHeader == null || authHeader.equals("")) {
            return false;
        }

        authHeader = authHeader.trim();
        String [] parts = authHeader.split(" ");
        if (parts.length != 2) {
            return false;
        }

        String authType = parts[0];
        String authInfo = parts[1];

        if (authType.equalsIgnoreCase(AUTHENTICATION_SCHEME_BASIC)) {
            String decoded = new String(Base64.decodeBase64(authInfo));
            parts = decoded.split(":");
            if (parts.length != 2) {
                return false;
            }
            String user = parts[0];
            String password = parts[1];

            Subject subject = doAuthenticate(realm, role, user, password);
            if (subject == null) {
                return false;
            }

            /*
            HttpSession session = request.getSession(true);
            session.setAttribute("user", user);
            session.setAttribute("org.osgi.service.http.authentication.remote.user", user);
            session.setAttribute("org.osgi.service.http.authentication.type", HttpServletRequest.BASIC_AUTH);
            */

            return true;
        }

        return false;
    }

    private static Subject doAuthenticate(String realm, String role, final String username, final String password) {
        try {

            Subject subject = new Subject();
            LoginContext loginContext = new LoginContext(realm, subject, new CallbackHandler() {

                @Override
                public void handle(Callback[] callbacks) throws IOException, UnsupportedCallbackException {
                    for (Callback callback : callbacks) {
                        if (callback instanceof NameCallback) {
                            ((NameCallback)callback).setName(username);
                        } else if (callback instanceof PasswordCallback) {
                            ((PasswordCallback)callback).setPassword(password.toCharArray());                                } else {
                            throw new UnsupportedCallbackException(callback);
                        }
                    }
                }
            });
            loginContext.login();

            if (role != null && role.length() > 0) {
                String clazz = "org.apache.karaf.jaas.boot.principal.RolePrincipal";
                String name = role;
                int idx = role.indexOf(':');
                if (idx > 0) {
                    clazz = role.substring(0, idx);
                    name = role.substring(idx + 1);
                }
                boolean found = false;
                for (Principal p : subject.getPrincipals()) {
                    if (p.getClass().getName().equals(clazz)
                            && p.getName().equals(name)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    throw new FailedLoginException("User does not have the required role " + role);
                }
            }

            return subject;

        } catch (AccountException e) {
            LOG.warn("Account failure", e);
        } catch (LoginException e) {
            LOG.debug("Login failed", e);
        } catch (GeneralSecurityException e) {
            LOG.error("General Security Exception", e);
        }

        return null;
    }
}
