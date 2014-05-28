package io.hawt.system;

import java.io.IOException;
import java.security.Principal;
import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.NameCallback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.security.auth.login.AccountException;
import javax.security.auth.login.Configuration;
import javax.security.auth.login.LoginContext;
import javax.security.auth.login.LoginException;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To perform authentication using JAAS using the {@link LoginContext} for the choosen realm.
 */
public class Authenticator {

    private static final transient Logger LOG = LoggerFactory.getLogger(Authenticator.class);

    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String AUTHENTICATION_SCHEME_BASIC = "Basic";

    public static void extractAuthInfo(String authHeader, ExtractAuthInfoCallback cb) {
        authHeader = authHeader.trim();
        String[] parts = authHeader.split(" ");
        if (parts.length != 2) {
            return;
        }

        String authType = parts[0];
        String authInfo = parts[1];

        if (authType.equalsIgnoreCase(AUTHENTICATION_SCHEME_BASIC)) {
            String decoded = new String(Base64.decodeBase64(authInfo));
            parts = decoded.split(":");
            if (parts.length != 2) {
                return;
            }
            String user = parts[0];
            String password = parts[1];
            cb.getAuthInfo(user, password);
        }
    }

    public static AuthenticateResult authenticate(String realm, String role, String rolePrincipalClasses, Configuration configuration,
                                                  HttpServletRequest request, PrivilegedCallback cb) {

        String authHeader = request.getHeader(HEADER_AUTHORIZATION);

        if (authHeader == null || authHeader.equals("")) {
            return AuthenticateResult.NO_CREDENTIALS;
        }

        final AuthInfo info = new AuthInfo();

        Authenticator.extractAuthInfo(authHeader, new ExtractAuthInfoCallback() {
            @Override
            public void getAuthInfo(String userName, String password) {
                info.username = userName;
                info.password = password;
            }
        });

        if (info.username == null || info.username.equals("public")) {
            return AuthenticateResult.NO_CREDENTIALS;
        }

        if (info.set()) {
            Subject subject = doAuthenticate(realm, role, rolePrincipalClasses, configuration, info.username, info.password);
            if (subject == null) {
                return AuthenticateResult.NOT_AUTHORIZED;
            }

            if (cb != null) {
                try {
                    cb.execute(subject);
                } catch (Exception e) {
                    LOG.warn("Failed to execute privileged action: ", e);
                }
            }

            return AuthenticateResult.AUTHORIZED;
        }

        return AuthenticateResult.NO_CREDENTIALS;
    }

    private static Subject doAuthenticate(String realm, String role, String rolePrincipalClasses, Configuration configuration,
                                          final String username, final String password) {
        try {

            if (LOG.isDebugEnabled()) {
                LOG.debug("doAuthenticate[realm={}, role={}, rolePrincipalClasses={}, configuration={}, username={}, password={}]",
                        new Object[]{realm, role, rolePrincipalClasses, configuration, username, "******"});
            }

            Subject subject = new Subject();
            CallbackHandler handler = new AuthenticationCallbackHandler(username, password);

            // call the constructor with or without the configuration as it behaves differently
            LoginContext loginContext;
            if (configuration != null) {
                loginContext = new LoginContext(realm, subject, handler, configuration);
            } else {
                loginContext = new LoginContext(realm, subject, handler);
            }

            loginContext.login();

            if (role == null || role.equals("")) {
                LOG.debug("Skipping role check, no role configured");
                return subject;
            }

            if (role.equals("*")) {
                LOG.debug("Skipping role check, all roles allowed");
                return subject;
            }

            if (rolePrincipalClasses == null || rolePrincipalClasses.equals("")) {
                LOG.debug("Skipping role check, no rolePrincipalClasses configured");
                return subject;
            }

            String[] rolePrincipalClazzes = rolePrincipalClasses.split(",");
            boolean found = false;
            for (String clazz : rolePrincipalClazzes) {
                LOG.debug("Looking for rolePrincipalClass: {}", clazz);
                for (Principal p : subject.getPrincipals()) {
                    LOG.debug("Checking principal, classname: {} toString: {}", p.getClass().getName(), p);
                    if (!p.getClass().getName().equals(clazz.trim())) {
                        LOG.debug("principal class {} doesn't match {}, continuing", p.getClass().getName(), clazz.trim());
                        continue;
                    }
                    if (!p.getName().equals(role)) {
                        LOG.debug("role {} doesn't match {}, continuing", p.getName(), role);
                        continue;
                    }
                    LOG.debug("Matched role and role principal class");
                    found = true;
                    break;
                }
                if (found) {
                    break;
                }
            }
            if (!found) {
                LOG.debug("User " + username + " does not have the required role " + role);
                return null;
            }

            return subject;

        } catch (AccountException e) {
            LOG.warn("Account failure", e);
        } catch (LoginException e) {
            // do not be so verbose at DEBUG level
            if (LOG.isTraceEnabled()) {
                LOG.trace("Login failed due " + e.getMessage(), e);
            } else {
                LOG.debug("Login failed due " + e.getMessage());
            }
        }

        return null;
    }

    private static final class AuthenticationCallbackHandler implements CallbackHandler {

        private final String username;
        private final String password;

        private AuthenticationCallbackHandler(String username, String password) {
            this.username = username;
            this.password = password;
        }

        @Override
        public void handle(Callback[] callbacks) throws IOException, UnsupportedCallbackException {
            for (Callback callback : callbacks) {
                if (LOG.isTraceEnabled()) {
                    LOG.trace("Callback type {} -> {}", callback.getClass(), callback);
                }
                if (callback instanceof NameCallback) {
                    ((NameCallback) callback).setName(username);
                } else if (callback instanceof PasswordCallback) {
                    ((PasswordCallback) callback).setPassword(password.toCharArray());
                } else {
                    LOG.debug("Unknown callback class [" + callback.getClass().getName() + "]");
                }
            }
        }
    }

}
