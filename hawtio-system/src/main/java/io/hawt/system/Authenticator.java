package io.hawt.system;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.security.Principal;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
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

import io.hawt.web.auth.AuthenticationConfiguration;
import org.apache.commons.codec.binary.Base64;
import org.apache.karaf.jaas.boot.principal.ClientPrincipal;
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

    public static void extractAuthInfo(String authHeader, BiConsumer<String, String> callback) {
        authHeader = authHeader.trim();
        String[] parts = authHeader.split(" ");
        if (parts.length != 2) {
            return;
        }

        String authType = parts[0];
        String authInfo = parts[1];

        if (authType.equalsIgnoreCase(AUTHENTICATION_SCHEME_BASIC)) {
            String decoded = new String(Base64.decodeBase64(authInfo));
            int delimiter = decoded.indexOf(':');
            if (delimiter < 0) {
                return;
            }
            String user = decoded.substring(0, delimiter);
            String password = decoded.substring(delimiter + 1);
            callback.accept(user, password);
        }
    }

    public static void logout(AuthenticationConfiguration authConfiguration, Subject subject) {
        try {
            LoginContext loginContext = new LoginContext(authConfiguration.getRealm(), subject);
            loginContext.logout();
        } catch (Exception e) {
            LOG.warn("Error occurred while logging out", e);
        }
    }

    public static AuthenticateResult authenticate(AuthenticationConfiguration authConfiguration,
                                                  HttpServletRequest request, Consumer<Subject> callback) {

        String authHeader = request.getHeader(HEADER_AUTHORIZATION);

        if (authHeader == null || authHeader.equals("")) {
            return AuthenticateResult.NO_CREDENTIALS;
        }

        AuthInfo info = new AuthInfo();

        extractAuthInfo(authHeader, (userName, password) -> {
            info.username = userName;
            info.password = password;
        });

        if (info.username == null || info.username.equals("public")) {
            return AuthenticateResult.NO_CREDENTIALS;
        }

        if (info.isSet()) {
            return authenticate(authConfiguration, request, info.username, info.password, callback);
        }

        return AuthenticateResult.NO_CREDENTIALS;
    }

    public static AuthenticateResult authenticate(AuthenticationConfiguration authConfiguration,
                                                  HttpServletRequest request,
                                                  String username, String password, Consumer<Subject> callback) {
        Subject subject = doAuthenticate(
            request,
            authConfiguration.getRealm(),
            authConfiguration.getRole(),
            authConfiguration.getRolePrincipalClasses(),
            authConfiguration.getConfiguration(),
            username,
            password);
        if (subject == null) {
            return AuthenticateResult.NOT_AUTHORIZED;
        }

        if (callback != null) {
            try {
                callback.accept(subject);
            } catch (Exception e) {
                LOG.warn("Failed to execute privileged action:", e);
            }
        }

        return AuthenticateResult.AUTHORIZED;
    }

    private static Subject doAuthenticate(HttpServletRequest request, String realm, String role, String rolePrincipalClasses, Configuration configuration,
                                          final String username, final String password) {
        try {

            LOG.debug("doAuthenticate[realm={}, role={}, rolePrincipalClasses={}, configuration={}, username={}, password={}]",
                realm, role, rolePrincipalClasses, configuration, username, "******");

            Subject subject = new Subject();
            try {
                String addr = request.getRemoteHost() + ":" + request.getRemotePort();
                subject.getPrincipals().add(new ClientPrincipal("hawtio", addr));
            } catch (Throwable t) {
                // ignore
            }
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
                LOG.debug("User {} does not have the required role {}", username, role);
                return null;
            }

            return subject;

        } catch (AccountException e) {
            LOG.warn("Account failure", e);
        } catch (LoginException e) {
            LOG.warn("Login failed due to: {}", e.getMessage());
            LOG.debug("Failed stacktrace:", e);
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
        LOG.debug("Running on websphere: checking if the Role {} is in the set of groups in WSCredential", role);
        for (final Object cred : subject.getPublicCredentials()) {
            LOG.debug("Checking credential {} if it is a WebSphere specific WSCredential containing group info", cred);
            if (implementsInterface(cred, "com.ibm.websphere.security.cred.WSCredential")) {
                try {
                    Method groupsMethod = getWebSphereGetGroupsMethod(cred);
                    @SuppressWarnings("unchecked") final List<Object> groups = (List<Object>) groupsMethod.invoke(cred);

                    if (groups != null) {
                        LOG.debug("Found a total of {} groups in the IBM WebSphere Credentials", groups.size());

                        for (Object group : groups) {
                            LOG.debug("Matching IBM Websphere group name {} to required role {}", group, role);

                            String[] roleArray = role.split(",");
                            for (String r : roleArray) {
                                if (r.equals(group.toString())) {
                                    LOG.debug("Required role {} found in IBM WebSphere specific credentials", r);
                                    return true;
                                } else {
                                    LOG.debug("role {} doesn't match {}, continuing", r, group.toString());
                                }
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
        }
        return false;
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
