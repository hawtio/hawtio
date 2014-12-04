package io.hawt.system;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.security.Principal;
import java.util.List;
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

    private static Boolean websphereDetected;
    private static Method websphereGetGroupsMethod;

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

            boolean found;
            if (isRunningOnWebsphere(subject)) {
                found = checkIfSubjectHasRequiredRoleOnWebsphere(subject, role);
            } else {
                if (rolePrincipalClasses == null || rolePrincipalClasses.equals("")) {
                    LOG.debug("Skipping role check, no rolePrincipalClasses configured");
                    return subject;
                }

                found = checkIfSubjectHasRequiredRole(subject, role, rolePrincipalClasses);
            }

            if (!found) {
                LOG.debug("User " + username + " does not have the required role " + role);
                return null;
            }

            return subject;

        } catch (AccountException e) {
            LOG.warn("Account failure", e);
        } catch (LoginException e) {
            LOG.warn("Login failed due " + e.getMessage());
        }

        return null;
    }

    private static boolean checkIfSubjectHasRequiredRole(Subject subject,
                                                         String role, String rolePrincipalClasses) {
        String[] roleArray = role.split(",");
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
                for (String r : roleArray) {
                    if (r == null || !p.getName().equals(r.trim())) {
                        LOG.debug("role {} doesn't match {}, continuing", p.getName(), r);
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
            if (found) {
                break;
            }

        }
        return found;
    }

    private static boolean isRunningOnWebsphere(Subject subject) {
        if (websphereDetected == null) {
            boolean onWebsphere = false;
            for (Principal p : subject.getPrincipals()) {
                LOG.trace("Checking principal for IBM specific interfaces: {}", p);
                onWebsphere = implementsInterface(p, "com.ibm.websphere.security.auth.WSPrincipal");
            }
            LOG.trace("Checking if we are running using a IBM Websphere specific LoginModule: {}", onWebsphere);
            websphereDetected = onWebsphere;
        }
        return websphereDetected;
    }

    private static boolean checkIfSubjectHasRequiredRoleOnWebsphere(Subject subject, String role) {
        boolean found = false;

        LOG.debug("Running on websphere: checking if the Role {} is in the set of groups in WSCredential", role);
        for (final Object cred : subject.getPublicCredentials()) {
            LOG.debug("Checking credential {} if it is a WebSphere specific WSCredential containing group info", cred);
            if (implementsInterface(cred, "com.ibm.websphere.security.cred.WSCredential")) {
                try {
                    Method groupsMethod = getWebSphereGetGroupsMethod(cred);
                    @SuppressWarnings("unchecked")
                    final List<Object> groups = (List<Object>) groupsMethod.invoke(cred);

                    if (groups != null) {
                        LOG.debug("Found a total of {} groups in the IBM WebSphere Credentials", groups.size());

                        for (Object group : groups) {
                            LOG.debug("Matching IBM Websphere group name {} to required role {}", group, role);

                            if (role.equals(group.toString())) {
                                LOG.debug("Required role {} found in IBM specific credentials", role);
                                found = true;
                                break;
                            }
                        }
                    } else {
                        LOG.debug("The IBM Websphere groups list is null");
                    }

                } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
                    // ignored
                    LOG.debug("Caught exception trying to read groups from WebSphere specific WSCredentials class", e);
                }
            }

            if (found) {
                break;
            }
        }

        return found;
    }

    private static Method getWebSphereGetGroupsMethod(final Object cred) throws NoSuchMethodException {
        if (websphereGetGroupsMethod == null) {
            websphereGetGroupsMethod = cred.getClass().getMethod("getGroupIds");
        }
        return websphereGetGroupsMethod;
    }

    private static boolean implementsInterface(Object o, String interfaceName) {
        boolean implementsIf = false;
        for (Class<?> pif : o.getClass().getInterfaces()) {
            LOG.trace("Checking interface {} if it matches {}", pif, interfaceName);
            if (pif.getName().equals(interfaceName)) {
                implementsIf = true;
                break;
            }
        }
        return implementsIf;
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
