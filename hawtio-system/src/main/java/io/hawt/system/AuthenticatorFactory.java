package io.hawt.system;

import io.hawt.web.auth.AuthenticationConfiguration;

import javax.servlet.http.HttpServletRequest;

public interface AuthenticatorFactory {

    Authenticator createAuthenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration);

    Authenticator createAuthenticator(HttpServletRequest request, AuthenticationConfiguration authConfiguration, String username, String password);

}
