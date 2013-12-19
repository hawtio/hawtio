package io.hawt.web.tomcat;

import java.io.IOException;
import java.util.Map;
import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.NameCallback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.security.auth.login.LoginException;
import javax.security.auth.spi.LoginModule;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To use Apache Tomcat's conf/tomcat-users.xml user database as JAAS {@link javax.security.auth.login.LoginContext},
 * so hawtio can use that for its {@link io.hawt.web.AuthenticationFilter}.
 */
public class TomcatUserDatabaseLoginContext implements LoginModule {

    private static final transient Logger LOG = LoggerFactory.getLogger(TomcatUserDatabaseLoginContext.class);
    private Subject subject;
    private CallbackHandler callbackHandler;

    @Override
    public void initialize(Subject subject, CallbackHandler callbackHandler, Map<String, ?> sharedState, Map<String, ?> options) {
        this.subject = subject;
        this.callbackHandler = callbackHandler;
    }

    @Override
    public boolean login() throws LoginException {
        LOG.debug("Checking if user can login with Tomcat UserDatabase");

        // get username and password
        Callback[] callbacks = new Callback[2];
        callbacks[0] = new NameCallback("username");
        callbacks[1] = new PasswordCallback("password", false);

        try {
            callbackHandler.handle(callbacks);
            String username = ((NameCallback)callbacks[0]).getName();
            char[] tmpPassword = ((PasswordCallback)callbacks[1]).getPassword();
            String password = new String(tmpPassword);
            ((PasswordCallback)callbacks[1]).clearPassword();

            // TODO: load conf/tomcat-users.xml file and check the username/role there
            // TODO: or introduce a hawtio-tomcat module which uses catalina.jar API to
            // lookup the UserDatabase in JNID if that would be possible

            // only allow login if password is secret
            // as this is just for testing purpose
            if (!"secret".equals(password)) {
                throw new LoginException("Login denied");
            }

            // add roles
            if ("scott".equals(username)) {
                subject.getPrincipals().add(new TomcatPrincipal("admin"));
                subject.getPrincipals().add(new TomcatPrincipal("guest"));
            } else if ("guest".equals(username)) {
                subject.getPrincipals().add(new TomcatPrincipal("guest"));
            }

        } catch (IOException ioe) {
            LoginException le = new LoginException(ioe.toString());
            le.initCause(ioe);
            throw le;
        } catch (UnsupportedCallbackException uce) {
            LoginException le = new LoginException("Error: " + uce.getCallback().toString()
                    + " not available to gather authentication information from the user");
            le.initCause(uce);
            throw le;
        }

        return true;
    }

    @Override
    public boolean commit() throws LoginException {
        return true;
    }

    @Override
    public boolean abort() throws LoginException {
        return true;
    }

    @Override
    public boolean logout() throws LoginException {
        subject = null;
        callbackHandler = null;
        return true;
    }
}
