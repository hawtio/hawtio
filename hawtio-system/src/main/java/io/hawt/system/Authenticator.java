package io.hawt.system;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.security.Principal;
import java.security.cert.CertificateEncodingException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.NameCallback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.auth.login.AccountException;
import javax.security.auth.login.Configuration;
import javax.security.auth.login.LoginContext;
import javax.security.auth.login.LoginException;
import javax.security.cert.CertificateException;
import jakarta.servlet.http.HttpServletRequest;

import io.hawt.util.Strings;
import io.hawt.web.auth.AuthenticationConfiguration;
import org.apache.commons.codec.binary.Base64;
import org.apache.karaf.jaas.boot.principal.ClientPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Authenticator performs authentication using JAAS with the {@link LoginContext} for the chosen realm.
 * <p>
 * Authenticator supports the following authentication methods:
 * <ul>
 * <li>a set of user name and password</li>
 * <li>client certificates</li>
 * </ul>
 */
public class Authenticator {

    private static final Logger LOG = LoggerFactory.getLogger(Authenticator.class);

    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String AUTHENTICATION_SCHEME_BASIC = "Basic";
    public static final String AUTHENTICATION_SCHEME_BEARER = "Bearer";
    public static final String ATTRIBUTE_X509_CERTIFICATE = "jakarta.servlet.request.X509Certificate";

    private static Boolean websphereDetected;
    private static Method websphereGetGroupsMethod;
    private static Boolean jbosseapDetected;
    private static Method jbosseapGetGroupsMethod;

    private final HttpServletRequest request;
    private final AuthenticationConfiguration authConfiguration;
    private String username;
    private String password;
    private X509Certificate[] certificates;

    /**
     * Explicit username/password authenticator when authenticating users from login page.
     */
    public Authenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration,
                         String username, String password) {
        this.request = request;
        this.authConfiguration = authConfiguration;
        this.username = username;
        this.password = password;
    }

    /**
     * Request-based authenticator such as when authenticating direct Jolokia accesses.
     */
    public Authenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration) {
        this.request = request;
        this.authConfiguration = authConfiguration;

        // Basic auth
        extractAuthHeader(request, (username, password) -> {
            this.username = username;
            this.password = password;
        });

        // Client certificate auth
        Object certificates = request.getAttribute(ATTRIBUTE_X509_CERTIFICATE);
        if (certificates != null) {
            this.certificates = (X509Certificate[]) certificates;
        }
    }

    /**
     * Extracts username/password from Authorization header.
     * Callback is invoked only when Authorization header is present.
     */
    public static void extractAuthHeader(HttpServletRequest request, BiConsumer<String, String> callback) {
        String authHeader = request.getHeader(Authenticator.HEADER_AUTHORIZATION);
        if (Strings.isBlank(authHeader)) {
            return;
        }

        String[] parts = authHeader.trim().split(" ");
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
            String username = decoded.substring(0, delimiter);
            String password = decoded.substring(delimiter + 1);
            callback.accept(username, password);
        }

        if (authType.equalsIgnoreCase(AUTHENTICATION_SCHEME_BEARER)) {
            callback.accept("token", authInfo);
        }
    }

    public boolean isUsernamePasswordSet() {
        return Strings.isNotBlank(username) && Strings.isNotBlank(password);
    }

    public boolean hasNoCredentials() {
        return (!isUsernamePasswordSet() || username.equals("public")) && certificates == null;
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
            return AuthenticateResult.NO_CREDENTIALS;
        }

        Subject subject = doAuthenticate();
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

    protected Subject doAuthenticate() {
        String realm = authConfiguration.getRealm();
        String role = authConfiguration.getRole();
        String rolePrincipalClasses = authConfiguration.getRolePrincipalClasses();
        Configuration configuration = authConfiguration.getConfiguration();

        try {
            LOG.debug("doAuthenticate[realm={}, role={}, rolePrincipalClasses={}, configuration={}, username={}, password={}]",
                realm, role, rolePrincipalClasses, configuration, username, "******");

            Subject subject = initSubject();
            login(subject, realm, configuration);
            if (checkRoles(subject, role, rolePrincipalClasses)) {
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

    protected Subject initSubject() {
        Subject subject = new Subject();
        try {
            String addr = request.getRemoteHost() + ":" + request.getRemotePort();
            subject.getPrincipals().add(new ClientPrincipal("hawtio", addr));
        } catch (Throwable t) {
            // ignore
        }
        return subject;
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
        } else {
            return new CertificateCallbackHandler(certificates);
        }
    }

    protected boolean checkRoles(Subject subject, String role, String rolePrincipalClasses) {
        if (Strings.isBlank(role)) {
            LOG.debug("Skipping role check, no role configured");
            return true;
        }

        if (role.equals("*")) {
            LOG.debug("Skipping role check, all roles allowed");
            return true;
        }

        boolean found;
        if (isRunningOnWebsphere(subject)) {
            found = checkIfSubjectHasRequiredRoleOnWebsphere(subject, role);
        } else if (isRunningOnJbossEAP(subject)) {
            found = checkIfSubjectHasRequiredRoleOnJbossEAP(subject, role);
        } else {
            if (Strings.isBlank(rolePrincipalClasses)) {
                LOG.debug("Skipping role check, no rolePrincipalClasses configured");
                return true;
            }

            found = checkIfSubjectHasRequiredRole(subject, role, rolePrincipalClasses);
        }

        if (!found) {
            LOG.debug("User {} does not have the required role {}", username, role);
        }

        return found;
    }

    private boolean checkIfSubjectHasRequiredRole(Subject subject,
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

    private static boolean checkIfSubjectHasRequiredRoleOnJbossEAP(Subject subject, String role) {
        LOG.debug("Running on Jboss EAP: checking if the Role {} is in the set of groups in SimpleGroup", role);
        for (final Principal prin : subject.getPrincipals()) {
            LOG.debug("Checking principal {} if it is a Jboss specific SimpleGroup containing group info", prin);
            if ("org.jboss.security.SimpleGroup".equals(prin.getClass().getName()) && "Roles".equals(prin.getName())) {
                try {
                    Method groupsMethod = getJbossEAPGetGroupsMethod(prin);
                    @SuppressWarnings("unchecked") final Enumeration<Principal> groups = (Enumeration<Principal>) groupsMethod.invoke(prin);

                    if (groups != null) {
                        while (groups.hasMoreElements()) {
                            Principal group = groups.nextElement();
                            LOG.debug("Matching Jboss EAP group name {} to required role(s) {}", group, role);
                            String[] roleArray = role.split(",");
                            for (String r : roleArray) {
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
     * JAAS callback handler for X509 client certificates.
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

        @SuppressWarnings("deprecation")
        private void setCertificates(Callback callback) {
            try {
                // Artemis uses java.security.cert.X509Certificate class since the 2.18.0 version.
                Method method = callback.getClass().getDeclaredMethod(ARTEMIS_CALLBACK_METHOD, java.security.cert.X509Certificate[].class);
                method.invoke(callback, new Object[] { certificates });
            } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
                LOG.warn("Setting certificates to new callback failed", e);

                try {
                    // Artemis used deprecated javax.security.cert.X509Certificate class up to the 2.17.0 version.
                    Method method = callback.getClass().getDeclaredMethod(ARTEMIS_CALLBACK_METHOD, javax.security.cert.X509Certificate[].class);
                    method.invoke(callback, new Object[] { toJavax(certificates) });
                } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException |
                         CertificateEncodingException | CertificateException ex) {
                    LOG.error("Setting certificates to callback failed", ex);
                }
            }
        }

        @SuppressWarnings("deprecation")
        private static javax.security.cert.X509Certificate[] toJavax(X509Certificate[] certificates)
            throws CertificateEncodingException, CertificateException {
            List<javax.security.cert.X509Certificate> answer = new ArrayList<>();
            for (X509Certificate cert : certificates) {
                answer.add(javax.security.cert.X509Certificate.getInstance(cert.getEncoded()));
            }
            return answer.toArray(new javax.security.cert.X509Certificate[certificates.length]);
        }
    }

}
