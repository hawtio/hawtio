package io.hawt.web.tomcat;

import java.util.Map;
import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.NameCallback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.security.auth.login.LoginException;
import javax.security.auth.spi.LoginModule;

import io.hawt.web.auth.AuthenticationFilter;
import io.hawt.web.auth.RolePrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To use Apache Tomcat's conf/tomcat-users.xml user database as JAAS {@link javax.security.auth.login.LoginContext},
 * so hawtio can use that for its {@link AuthenticationFilter}.
 */
public class TomcatUsersLoginModule implements LoginModule {

    private static final Logger LOG = LoggerFactory.getLogger(TomcatUsersLoginModule.class);

    // option passed to this login module indicating a MessageDigest algorithm used for the passwords from
    // tomcat-users.xml configuration file
    public static final String OPTION_DIGEST_ALGORITHM = "DIGEST_ALGORITHM";
    // option passed to this login module pointing to a location of tomcat-users.xml file. Defaults
    // to ${catalina.base}/conf/tomcat-users.xml and ${catalina.home}/conf/tomcat-users.xml
    public static final String OPTION_TOMCAT_USER_LOCATION = "USER_LOCATION";

    // option used to pass an instance of io.hawt.web.tomcat.TomcatSupport object to
    // delegate operations. Otherwise we'd have to read the file on each login
    public static final String OPTION_TOMCAT_SUPPORT = "TOMCAT_JAAS_SUPPORT";

    private Subject subject;
    private CallbackHandler callbackHandler;

    private TomcatSupport support;

    private boolean loginSuccessful = false;
    private TomcatSupport.TomcatUser loggedUser;

    @Override
    public void initialize(Subject subject, CallbackHandler callbackHandler, Map<String, ?> sharedState, Map<String, ?> options) {
        // the subject to fill with principals (credentials, roles) during login
        this.subject = subject;
        // the callback handler to collect credentials
        this.callbackHandler = callbackHandler;

        Object supportObject = options.get(OPTION_TOMCAT_SUPPORT);
        if (supportObject == null) {
            // this login module was declared in a file configured with -Djava.security.auth.login.config,
            // so we can get only String options
            supportObject = new TomcatSupport(options);
        }
        if (!(supportObject instanceof TomcatSupport)) {
            throw new IllegalArgumentException("Unexpected class for TomcatUsersLoginModule support service: "
                    + supportObject.getClass().getName());
        }

        this.support = (TomcatSupport) supportObject;
    }

    @Override
    public boolean login() throws LoginException {
        // get username and password
        Callback[] callbacks = new Callback[2];
        callbacks[0] = new NameCallback("username");
        callbacks[1] = new PasswordCallback("password", false);

        try {
            callbackHandler.handle(callbacks);
            String username = ((NameCallback) callbacks[0]).getName();
            char[] tmpPassword = ((PasswordCallback) callbacks[1]).getPassword();
            String password = new String(tmpPassword);
            ((PasswordCallback) callbacks[1]).clearPassword();

            LOG.debug("Getting user details for username {}", username);
            TomcatSupport.TomcatUser user = support.attemptLogin(username, password);
            loginSuccessful = user != null;
            loggedUser = user;
            return loginSuccessful;
        } catch (UnsupportedCallbackException uce) {
            LoginException le = new LoginException("Error: " + uce.getCallback().getClass().getName()
                + " not available to gather authentication information from the user");
            le.initCause(uce);
            throw le;
        } catch (Exception ioe) {
            LoginException le = new LoginException(ioe.toString());
            le.initCause(ioe);
            throw le;
        }
    }

    @Override
    public boolean commit() {
        if (loggedUser != null) {
            subject.getPrincipals().add(new TomcatPrincipal(loggedUser.getUsername()));
            for (String role : loggedUser.getRoles()) {
                subject.getPrincipals().add(new RolePrincipal(role));
            }
        }
        return loginSuccessful;
    }

    @Override
    public boolean abort() {
        return loginSuccessful;
    }

    @Override
    public boolean logout() throws LoginException {
        if (subject.getPrincipals() != null) {
            subject.getPrincipals().removeIf(p -> TomcatPrincipal.class == p.getClass());
        }
        callbackHandler = null;
        return loginSuccessful;
    }

}
