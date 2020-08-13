package io.hawt.quarkus;

import io.hawt.web.auth.AuthSessionHelpers;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.LogoutServlet;
import io.hawt.web.auth.Redirector;
import io.quarkus.arc.Arc;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HawtioQuakusLogoutServlet extends LogoutServlet {

    private AuthenticationConfiguration authConfiguration;
    private Redirector redirector;

    @Override
    public void init() {
        authConfiguration = AuthenticationConfiguration.getConfiguration(getServletContext());
        redirector = Arc.container().instance(Redirector.class).get();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        AuthSessionHelpers.clear(request, authConfiguration, false);
        redirector.doRedirect(request, response, AuthenticationConfiguration.LOGIN_URL);
    }
}
