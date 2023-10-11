package io.hawt.system;

import io.hawt.util.Strings;
import io.hawt.web.auth.AuthenticationConfiguration;
import org.apache.karaf.jaas.boot.principal.ClientPrincipal;
import org.slf4j.Logger;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import java.security.cert.X509Certificate;
import java.util.function.Consumer;

import static io.hawt.system.Authentication.ATTRIBUTE_X509_CERTIFICATE;

public abstract class AbstractAuthenticator implements Authenticator {

    private final Logger log;
    protected HttpServletRequest request;
    protected AuthenticationConfiguration authConfiguration;
    protected String username;
    protected String password;
    protected X509Certificate[] certificates;


    /**
     * Explicit username/password authenticator when authenticating users from login page.
     */
    public AbstractAuthenticator(Logger log, HttpServletRequest request, AuthenticationConfiguration authConfiguration, String username, String password) {
        this.log = log;
        this.request = request;
        this.authConfiguration = authConfiguration;
        this.username = username;
        this.password = password;
    }

    /**
     * Request-based authenticator such as when authenticating direct Jolokia accesses.
     */
    public AbstractAuthenticator(Logger log, HttpServletRequest request, AuthenticationConfiguration authConfiguration) {
        this.log = log;
        this.request = request;
        this.authConfiguration = authConfiguration;

        // Basic auth
        Authentication.extractAuthHeader(request, (username, password) -> {
            this.username = username;
            this.password = password;
        });

        // Client certificate auth
        Object certificates = request.getAttribute(ATTRIBUTE_X509_CERTIFICATE);
        if (certificates != null) {
            this.certificates = (X509Certificate[]) certificates;
        }
    }


    public boolean isUsernamePasswordSet() {
        return Strings.isNotBlank(username) && Strings.isNotBlank(password);
    }

    public boolean hasNoCredentials() {
        return (!isUsernamePasswordSet() || username.equals("public")) && certificates == null;
    }

    @Override
    public final AuthenticateResult authenticate(Consumer<Subject> callback) {
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
                log.warn("Failed to execute privileged action:", e);
            }
        }

        return AuthenticateResult.AUTHORIZED;
    }

    public final Subject initSubject() {
        Subject subject = new Subject();
        try {
            String addr = request.getRemoteHost() + ":" + request.getRemotePort();
            subject.getPrincipals().add(new ClientPrincipal("hawtio", addr));
        } catch (Throwable t) {
            // ignore
        }
        return subject;
    }

    protected abstract Subject doAuthenticate();

}
