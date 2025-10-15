package io.hawt.system;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.security.Principal;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Enumeration;
import java.util.List;
import java.util.Optional;
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

import io.hawt.web.auth.oidc.token.BearerTokenCallback;
import jakarta.servlet.http.HttpServletRequest;

import io.hawt.util.Strings;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.AuthenticationThrottler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Authenticator performs authentication using JAAS with the {@link LoginContext} for the chosen realm.
 * <p>
 * Authenticator supports the following authentication methods:
 * <ul>
 * <li>a set of user name and password</li>
 * <li>oidc (bearer) access token</li>
 * <li>client certificates</li>
 * </ul>
 */
public class Authenticator {

    private static final Logger LOG = LoggerFactory.getLogger(Authenticator.class);

    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String X_J_HEADER_AUTHORIZATION = "X-Jolokia-Authorization";
    public static final String AUTHENTICATION_SCHEME_BASIC = "Basic";
    public static final String AUTHENTICATION_SCHEME_BEARER = "Bearer";
    public static final String ATTRIBUTE_X509_CERTIFICATE = "jakarta.servlet.request.X509Certificate";

    private static Boolean websphereDetected;
    private static Method websphereGetGroupsMethod;
    private static Boolean jbosseapDetected;
    private static Method jbosseapGetGroupsMethod;

    private final AuthenticationConfiguration authConfiguration;

    // Basic auth username
    private String username;
    // Basic auth password
    private String password;
    // Bearer token
    private String token;
    // Certificate(s) from the request's jakarta.servlet.request.X509Certificate attribute
    private X509Certificate[] certificates;
    // existing principal from request.getUserPrincipal()
    private Principal requestPrincipal;

    /**
     * Explicit username/password authenticator when authenticating users from login page. This constructor
     * should also be a hint that special login modules (not relying on user/password) should be ignored.
     */
    public Authenticator(AuthenticationConfiguration authConfiguration, String username, String password) {
        this.authConfiguration = authConfiguration;
        this.username = username;
        this.password = password;
        this.token = null;
    }

    /**
     * Request-based authenticator such as when authenticating direct Jolokia accesses or when the credentials are
     * obtained in different way (including pre configured credentials available in
     * {@link HttpServletRequest#getUserPrincipal()})
     */
    public Authenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration) {
        this.authConfiguration = authConfiguration;

        // "Authorization: Basic" and "Authorization: Bearer"
        extractAuthHeader(request,
                (username, password) -> {
                    this.username = username;
                    this.password = password;
                },
                (token) -> {
                    this.token = token;
                },
                false);

        // Client certificate auth
        Object certificates = request.getAttribute(ATTRIBUTE_X509_CERTIFICATE);
        if (certificates != null) {
            this.certificates = (X509Certificate[]) certificates;
        }

        // existing auth - can be configured by Spring Security
        this.requestPrincipal = request.getUserPrincipal();
    }

    /**
     * Extracts username/password from Authorization header.
     * Callback is invoked only when Authorization header is present.
     */
    public static void extractAuthHeader(HttpServletRequest request, BiConsumer<String, String> callback) {
        extractAuthHeader(request, callback, false);
    }

    /**
     * Extracts credentials from {@code Authorization} header. Callback is invoked only when Authorization header is
     * present.
     *
     * @param request
     * @param callback
     * @param checkExtraHeaders when {@code true}, check special {@code X-Jolokia-Authorization} header.
     */
    public static void extractAuthHeader(HttpServletRequest request, BiConsumer<String, String> callback,
            boolean checkExtraHeaders) {
        extractAuthHeader(request, callback, null, checkExtraHeaders);
    }

    /**
     * Extracts credentials or Bearer token from {@code Authorization} header. Callbacks are invoked only when Authorization header is
     * present.
     *
     * @param request
     * @param credentialsCallback
     * @param tokenCallback
     * @param checkExtraHeaders when {@code true}, check special {@code X-Jolokia-Authorization} header.
     */
    public static void extractAuthHeader(HttpServletRequest request, BiConsumer<String, String> credentialsCallback,
            Consumer<String> tokenCallback, boolean checkExtraHeaders) {
        String authHeader = null;
        if (checkExtraHeaders) {
            authHeader = request.getHeader(X_J_HEADER_AUTHORIZATION);
        }
        if (Strings.isBlank(authHeader)) {
            authHeader = request.getHeader(Authenticator.HEADER_AUTHORIZATION);
        }
        if (Strings.isBlank(authHeader)) {
            return;
        }

        String[] parts = authHeader.trim().split(" ");
        if (parts.length != 2) {
            return;
        }

        String authType = parts[0];
        String authInfo = parts[1];

        if (credentialsCallback != null && authType.equalsIgnoreCase(AUTHENTICATION_SCHEME_BASIC)) {
            String decoded = new String(Base64.getDecoder().decode(authInfo));
            int delimiter = decoded.indexOf(':');
            if (delimiter < 0) {
                return;
            }
            String username = decoded.substring(0, delimiter);
            String password = decoded.substring(delimiter + 1);
            credentialsCallback.accept(username, password);
        }

        if (tokenCallback != null && authType.equalsIgnoreCase(AUTHENTICATION_SCHEME_BEARER)) {
            tokenCallback.accept(authInfo);
        }
    }

    public boolean isUsernamePasswordSet() {
        return Strings.isNotBlank(username) && Strings.isNotBlank(password);
    }

    public boolean isTokenSet() {
        return Strings.isNotBlank(token);
    }

    public boolean hasNoCredentials() {
        return (!isUsernamePasswordSet() || username.equals("public")) && certificates == null
                && requestPrincipal == null && token == null;
    }

    public static void logout(AuthenticationConfiguration authConfiguration, Subject subject) {
        try {
            LoginContext loginContext = new LoginContext(authConfiguration.getRealm(), subject);
            loginContext.logout();
        } catch (Exception e) {
            LOG.warn("Error occurred while logging out", e);
        }
    }

    public AuthenticateResult authenticate(Consumer<Subject> callback) {
        if (hasNoCredentials()) {
            return AuthenticateResult.noCredentials();
        }

        // Try throttling authentication request when necessary
        Optional<AuthenticationThrottler> throttler = authConfiguration.getThrottler();
        AuthenticationThrottler.Attempt attempt = throttler
            .map(t -> t.attempt(username))
            .filter(AuthenticationThrottler.Attempt::isBlocked)
            .orElse(null);
        if (attempt != null) {
            LOG.debug("Authentication throttled: {}", attempt);
            return AuthenticateResult.throttled(attempt.retryAfter());
        }

        Subject subject = doAuthenticate();
        if (subject == null) {
            throttler.ifPresent(t -> t.increase(username));
            return AuthenticateResult.notAuthorized();
        }
        throttler.ifPresent(t -> t.reset(username));

        if (callback != null) {
            try {
                callback.accept(subject);
            } catch (Exception e) {
                LOG.warn("Failed to execute privileged action:", e);
            }
        }

        return AuthenticateResult.authorized();
    }

    protected Subject doAuthenticate() {
        String realm = authConfiguration.getRealm();
        List<String> roles = authConfiguration.getRoles();
        List<Class<Principal>> rolePrincipalClasses = authConfiguration.getRolePrincipalClasses();
        Configuration configuration = authConfiguration.getConfiguration();

        try {
            LOG.debug("doAuthenticate[realm={}, roles={}, rolePrincipalClasses={}, configuration={}, username={}, password={}]",
                realm, String.join(", ", roles), rolePrincipalClasses, configuration, username, "******");

            Subject subject = new Subject();
            login(subject, realm, configuration);
            if (checkRoles(subject, roles, rolePrincipalClasses)) {
                return subject;
            }
        } catch (AccountException e) {
            LOG.warn("Account failure", e);
        } catch (LoginException e) {
            LOG.warn("Login failed due to: {}", e.getMessage());
            LOG.debug("Failed stacktrace:", e);
        }

        return null;
    }

    protected void login(Subject subject, String realm, Configuration configuration) throws LoginException {
        CallbackHandler handler = createCallbackHandler();

        // call the constructor with or without the configuration as it behaves differently
        LoginContext loginContext;
        if (configuration != null) {
            loginContext = new LoginContext(realm, subject, handler, configuration);
        } else {
            loginContext = new LoginContext(realm, subject, handler);
        }

        loginContext.login();
    }

    private CallbackHandler createCallbackHandler() {
        if (isUsernamePasswordSet()) {
            return new UsernamePasswordCallbackHandler(username, password);
        } else if (isTokenSet()) {
            return new BearerTokenCallbackHandler(token);
        } else {
            return new CertificateCallbackHandler(certificates);
        }
    }

    protected boolean checkRoles(Subject subject, List<String> roles, List<Class<Principal>> rolePrincipalClasses) {
        if (roles.isEmpty()) {
            LOG.debug("Skipping role check, no role configured");
            return true;
        }

        if (roles.contains("*")) {
            LOG.debug("Skipping role check, all roles allowed (wildcard role \"*\" configured");
            return true;
        }

        boolean found;
        if (isRunningOnWebsphere(subject)) {
            found = checkIfSubjectHasRequiredRoleOnWebsphere(subject, roles);
        } else if (isRunningOnJbossEAP(subject)) {
            found = checkIfSubjectHasRequiredRoleOnJbossEAP(subject, roles);
        } else {
            if (rolePrincipalClasses.isEmpty()) {
                LOG.debug("Skipping role check, no rolePrincipalClasses configured");
                return true;
            }

            found = checkIfSubjectHasRequiredRole(subject, roles, rolePrincipalClasses);
        }

        if (!found) {
            LOG.debug("User {} does not have the required role(s) {}", username, String.join(", ", roles));
        }

        return found;
    }

    private boolean checkIfSubjectHasRequiredRole(Subject subject, List<String> roles,
            List<Class<Principal>> rolePrincipalClasses) {
        boolean found = false;
        for (Class<Principal> clazz : rolePrincipalClasses) {
            LOG.debug("Looking for rolePrincipalClass: {}", clazz);
            for (Principal p : subject.getPrincipals()) {
                LOG.debug("Checking principal, classname: {} toString: {}", p.getClass().getName(), p);
                if (!clazz.isAssignableFrom(p.getClass())) {
                    LOG.debug("principal class {} doesn't match {}, continuing", p.getClass().getName(), clazz.getName());
                    continue;
                }
                for (String r : roles) {
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

    private static boolean isRunningOnJbossEAP(Subject subject) {
        if (jbosseapDetected == null) {
            boolean onJbossEAP = false;
            for (Principal p : subject.getPrincipals()) {
                LOG.trace("Checking principal for JBoss EAP specific interfaces: {} {}", p, p.getClass().getName());
                onJbossEAP = "org.jboss.security.SimplePrincipal".equals(p.getClass().getName());
                if (onJbossEAP) break;
            }
            LOG.trace("Checking if we are running using a Jboss EAP specific LoginModule: {}", onJbossEAP);
            jbosseapDetected = onJbossEAP;
        }
        return jbosseapDetected;
    }

    private static boolean checkIfSubjectHasRequiredRoleOnWebsphere(Subject subject, List<String> roles) {
        LOG.debug("Running on websphere: checking if the Role {} is in the set of groups in WSCredential",
                String.join(", ", roles));

        for (final Object cred : subject.getPublicCredentials()) {
            LOG.debug("Checking credential {} if it is a WebSphere specific WSCredential containing group info", cred);
            if (implementsInterface(cred, "com.ibm.websphere.security.cred.WSCredential")) {
                try {
                    Method groupsMethod = getWebSphereGetGroupsMethod(cred);
                    @SuppressWarnings("unchecked") final List<Object> groups = (List<Object>) groupsMethod.invoke(cred);

                    if (groups != null) {
                        LOG.debug("Found a total of {} groups in the IBM WebSphere Credentials", groups.size());

                        for (Object group : groups) {
                            LOG.debug("Matching IBM Websphere group name {} to required role {}", group, roles);

                            for (String r : roles) {
                                if (r.equals(group.toString())) {
                                    LOG.debug("Required role {} found in IBM WebSphere specific credentials", r);
                                    return true;
                                } else {
                                    LOG.debug("role {} doesn't match {}, continuing", r, group);
                                }
                            }
                        }
                    } else {
                        LOG.debug("The IBM Websphere groups list is null");
                    }

                } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException |
                         InvocationTargetException e) {
                    // ignored
                    LOG.debug("Caught exception trying to read groups from WebSphere specific WSCredentials class", e);
                }
            }
        }
        return false;
    }

    private static boolean checkIfSubjectHasRequiredRoleOnJbossEAP(Subject subject, List<String> roles) {
        LOG.debug("Running on Jboss EAP: checking if the Role {} is in the set of groups in SimpleGroup",
                String.join(", ", roles));

        for (final Principal p : subject.getPrincipals()) {
            LOG.debug("Checking principal {} if it is a Jboss specific SimpleGroup containing group info", p);
            if ("org.jboss.security.SimpleGroup".equals(p.getClass().getName()) && "Roles".equals(p.getName())) {
                try {
                    Method groupsMethod = getJbossEAPGetGroupsMethod(p);
                    @SuppressWarnings("unchecked") final Enumeration<Principal> groups = (Enumeration<Principal>) groupsMethod.invoke(p);

                    if (groups != null) {
                        while (groups.hasMoreElements()) {
                            Principal group = groups.nextElement();
                            LOG.debug("Matching Jboss EAP group name {} to required role(s) {}", group, String.join(", ", roles));
                            for (String r : roles) {
                                if (r.equals(group.toString())) {
                                    LOG.debug("Required role {} found in Jboss EAP specific credentials", r);
                                    return true;
                                } else {
                                    LOG.debug("role {} doesn't match {}, continuing", r, group);
                                }
                            }
                        }
                    } else {
                        LOG.debug("The Jboss EAP groups list is null");
                    }

                } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException |
                         InvocationTargetException e) {
                    // ignored
                    LOG.debug("Caught exception trying to read groups from JBoss EAP specific SimpleGroup class", e);
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

    private static Method getJbossEAPGetGroupsMethod(final Object cred) throws NoSuchMethodException {
        if (jbosseapGetGroupsMethod == null) {
            jbosseapGetGroupsMethod = cred.getClass().getMethod("members");
        }
        return jbosseapGetGroupsMethod;
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

    /**
     * JAAS callback handler for username & password.
     */
    private static final class UsernamePasswordCallbackHandler implements CallbackHandler {

        private final String username;
        private final String password;

        private UsernamePasswordCallbackHandler(String username, String password) {
            this.username = username;
            this.password = password;
        }

        @Override
        public void handle(Callback[] callbacks) {
            for (Callback callback : callbacks) {
                if (LOG.isTraceEnabled()) {
                    LOG.trace("Callback type {} -> {}", callback.getClass(), callback);
                }
                if (callback instanceof NameCallback) {
                    ((NameCallback) callback).setName(username);
                } else if (callback instanceof PasswordCallback) {
                    ((PasswordCallback) callback).setPassword(password.toCharArray());
                } else {
                    LOG.debug("Unknown callback class [{}]", callback.getClass().getName());
                }
            }
        }
    }

    /**
     * {@link CallbackHandler} to pass the bearer token to the {@link javax.security.auth.spi.LoginModule}.
     */
    private static final class BearerTokenCallbackHandler implements CallbackHandler {
        private final String token;

        private BearerTokenCallbackHandler(String token) {
            this.token = token;
        }

        @Override
        public void handle(Callback[] callbacks) throws UnsupportedCallbackException {
            for (Callback callback : callbacks) {
                if (callback instanceof BearerTokenCallback) {
                    ((BearerTokenCallback) callback).setToken(token);
                } else {
                    throw new UnsupportedCallbackException(callback);
                }
            }
        }
    }

    /**
     * JAAS callback handler for X509 client certificates - but dedicated to Artemis and its
     * {@code org.apache.activemq.artemis.spi.core.security.jaas.CertificateCallback}
     */
    private static final class CertificateCallbackHandler implements CallbackHandler {

        private static final String ARTEMIS_CALLBACK = "org.apache.activemq.artemis.spi.core.security.jaas.CertificateCallback";
        private static final String ARTEMIS_CALLBACK_METHOD = "setCertificates";

        private final X509Certificate[] certificates;

        private CertificateCallbackHandler(X509Certificate[] certificates) {
            this.certificates = certificates;
        }

        @Override
        public void handle(Callback[] callbacks) {
            for (Callback callback : callbacks) {
                if (LOG.isTraceEnabled()) {
                    LOG.trace("Callback type {} -> {}", callback.getClass(), callback);
                }
                // currently supports only Apache ActiveMQ Artemis
                switch (callback.getClass().getName()) {
                case ARTEMIS_CALLBACK:
                    setCertificates(callback);
                    break;
                default:
                    LOG.warn("Callback class not supported: {}", callback.getClass().getName());
                }
            }
        }

        private void setCertificates(Callback callback) {
            try {
                // Artemis uses java.security.cert.X509Certificate class since the 2.18.0 version.
                Method method = callback.getClass().getDeclaredMethod(ARTEMIS_CALLBACK_METHOD, X509Certificate[].class);
                method.invoke(callback, new Object[] { certificates });
            } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
                LOG.error("Setting certificates to callback failed", e);

                // Artemis <=2.17 is no longer supported as it used deprecated javax.security.cert.X509Certificate class.
            }
        }
    }

}
