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
import java.security.Principal;

/**
 * @author Stan Lewis
 */
public class Authenticator {

    private static final transient Logger LOG = LoggerFactory.getLogger(Authenticator.class);

    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String AUTHENTICATION_SCHEME_BASIC = "Basic";

    public static void extractAuthInfo(String authHeader, ExtractAuthInfoCallback cb) {
        authHeader = authHeader.trim();
        String [] parts = authHeader.split(" ");
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

    public static AuthenticateResult authenticate(String realm, String role, String rolePrincipalClasses, HttpServletRequest request, PrivilegedCallback cb) {

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

            Subject subject = doAuthenticate(realm, role, rolePrincipalClasses, info.username, info.password);
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

    private static Subject doAuthenticate(String realm, String role,  String rolePrincipalClasses, final String username, final String password) {
        try {

            Subject subject = new Subject();
            LoginContext loginContext = new LoginContext(realm, subject, new CallbackHandler() {

                @Override
                public void handle(Callback[] callbacks) throws IOException, UnsupportedCallbackException {
                    for (Callback callback : callbacks) {
                        if (callback instanceof NameCallback) {
                            ((NameCallback)callback).setName(username);
                        } else if (callback instanceof PasswordCallback) {
                            ((PasswordCallback)callback).setPassword(password.toCharArray());
                        } else {
                          LOG.warn("Unsupported callback class [" + callback.getClass().getName() + "]");
                            // throw new UnsupportedCallbackException(callback);
                        }
                    }
                }
            });
            loginContext.login();

            if (role != null && role.length() > 0 && rolePrincipalClasses != null && rolePrincipalClasses.length() > 0) {

                String[] rolePrincipalClazzes = rolePrincipalClasses.split(",");
                boolean found = false;
                for (String clazz : rolePrincipalClazzes) {
                    String name = role;
                    int idx = role.indexOf(':');
                    if (idx > 0) {
                        clazz = role.substring(0, idx);
                        name = role.substring(idx + 1);
                    }
                    for (Principal p : subject.getPrincipals()) {
                        if (p.getClass().getName().equals(clazz.trim())
                                && p.getName().equals(name)) {
                            found = true;
                            break;
                        }
                    }
                    if (found) {
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
        }

        return null;
    }
}
