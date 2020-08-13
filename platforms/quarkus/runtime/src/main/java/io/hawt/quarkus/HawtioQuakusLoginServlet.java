package io.hawt.quarkus;

import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.AuthSessionHelpers;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.LoginServlet;
import io.hawt.web.auth.Redirector;
import io.quarkus.arc.Arc;
import io.quarkus.security.AuthenticationFailedException;
import io.quarkus.security.credential.PasswordCredential;
import io.quarkus.security.identity.IdentityProviderManager;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.request.UsernamePasswordAuthenticationRequest;

import java.io.IOException;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

public class HawtioQuakusLoginServlet extends LoginServlet {

    @Override
    public void init() {
        Redirector redirector = Arc.container().instance(Redirector.class).get();
        setRedirector(redirector);
        super.init();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        JSONObject json = ServletHelpers.readObject(request.getReader());
        String username = (String) json.get("username");
        String password = (String) json.get("password");

        PasswordCredential credential = new PasswordCredential(password.toCharArray());
        UsernamePasswordAuthenticationRequest authenticationRequest = new UsernamePasswordAuthenticationRequest(username, credential);
        IdentityProviderManager identityProviderManager = Arc.container().instance(IdentityProviderManager.class).get();

        try {
            SecurityIdentity identity = identityProviderManager.authenticateBlocking(authenticationRequest);
            AuthenticationConfiguration authConfig = AuthenticationConfiguration.getConfiguration(getServletContext());
            String roleConfig = authConfig.getRole();
            if (roleConfig != null) {
                // Verify the allowed roles matches with those specified in Quarkus security config
                if (!roleConfig.isEmpty() && !roleConfig.equals("*")) {
                    String[] roles = roleConfig.split(",");
                    for (String role : roles) {
                        if (identity.getRoles().contains(role)) {
                            AuthSessionHelpers.setup(request.getSession(true), new Subject(), username, AuthSessionHelpers.getSessionTimeout(getServletContext()));
                            return;
                        }
                    }
                    ServletHelpers.doForbidden(response);
                } else {
                    // All roles permitted
                    AuthSessionHelpers.setup(request.getSession(true), new Subject(), username, AuthSessionHelpers.getSessionTimeout(getServletContext()));
                }
            }
        } catch (AuthenticationFailedException e) {
            ServletHelpers.doForbidden(response);
        }
    }
}
