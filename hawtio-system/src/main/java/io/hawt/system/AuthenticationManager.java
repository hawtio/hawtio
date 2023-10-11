package io.hawt.system;

import io.hawt.web.auth.AuthenticationConfiguration;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.ServiceLoader;
import java.util.function.Consumer;

public class AuthenticationManager {

    private static List<AuthenticatorFactory> authenticatorFactories;


    private AuthenticationManager() {

    }


    /**
     * Returns a non-empty list of factories able to create an authenticator. If custom authentication mechanism is used
     * on a server, it should be present here. If not, a default (JAAS) mechanism is always returned.
     *
     * @return  a non-empty list of authenticator factories supported by the server
     */
    private static List<AuthenticatorFactory> getAuthenticatorFactories() {
        if (authenticatorFactories == null) {
            authenticatorFactories = new ArrayList<>();
            ServiceLoader.load(AuthenticatorFactory.class).forEach(factory ->
                authenticatorFactories.add(factory)
            );
            if (authenticatorFactories.isEmpty()) {
                authenticatorFactories.add(new DefaultAuthenticatorFactory());
            }
        }
        return authenticatorFactories;
    }

    public static AuthenticateResult authenticate(HttpServletRequest request, AuthenticationConfiguration authConfiguration, Consumer<Subject> callback) {
        Authenticator authenticator = getAuthenticatorFactories().get(0).createAuthenticator(request, authConfiguration);
        return authenticator.authenticate(callback);
    }

    public static AuthenticateResult authenticate(HttpServletRequest request, AuthenticationConfiguration authConfiguration,
                                           String username, String password, Consumer<Subject> callback) {
        Authenticator authenticator = getAuthenticatorFactories().get(0).createAuthenticator(request, authConfiguration, username, password);
        return authenticator.authenticate(callback);
    }

    public static void logout(AuthenticationConfiguration authConfiguration, Subject subject) {
        Authenticator authenticator = getAuthenticatorFactories().get(0).createAuthenticator(null, authConfiguration, null, null);
        authenticator.logout(authConfiguration, subject);
    }




    private static class DefaultAuthenticatorFactory implements AuthenticatorFactory {

        @Override
        public Authenticator createAuthenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration) {
            return new JaasAuthenticator(request, authConfiguration);
        }

        @Override
        public Authenticator createAuthenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration, String username, String password) {
            return new JaasAuthenticator(request, authConfiguration, username, password);
        }

    }

}
