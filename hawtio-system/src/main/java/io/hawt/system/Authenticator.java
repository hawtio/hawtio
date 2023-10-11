package io.hawt.system;

import io.hawt.web.auth.AuthenticationConfiguration;

import javax.security.auth.Subject;
import java.util.function.Consumer;

public interface Authenticator {

    AuthenticateResult authenticate(Consumer<Subject> callback);

    void logout(AuthenticationConfiguration authConfiguration, Subject subject);

}
