package io.hawt.quarkus.servlets;

import java.io.IOException;

import javax.security.auth.Subject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.quarkus.auth.HawtioQuarkusAuthenticator;
import io.hawt.system.AuthenticateResult;
import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.AuthSessionHelpers;
import io.hawt.web.auth.LoginServlet;
import io.hawt.web.auth.Redirector;
import io.quarkus.arc.Arc;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HawtioQuakusLoginServlet extends LoginServlet {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioQuakusLoginServlet.class);

    private HawtioQuarkusAuthenticator authenticator;

    @Override
    public void init() {
        authenticator = Arc.container().instance(HawtioQuarkusAuthenticator.class).get();
        Redirector redirector = Arc.container().instance(Redirector.class).get();
        setRedirector(redirector);
        super.init();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        AuthSessionHelpers.clear(request, authConfiguration, false);

        JSONObject json = ServletHelpers.readObject(request.getReader());
        String username = (String) json.get("username");
        String password = (String) json.get("password");

        AuthenticateResult result = authenticator.authenticate(request, authConfiguration, username, password);
        switch (result) {
        case AUTHORIZED:
            LOG.info("Logging in user: {}", username);
            AuthSessionHelpers.setup(request.getSession(true), new Subject(), username, timeout);
            break;
        case NOT_AUTHORIZED:
        case NO_CREDENTIALS:
            ServletHelpers.doForbidden(response);
            break;
        }
    }
}
