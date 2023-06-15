package io.hawt.quarkus.servlets;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.hawt.web.auth.AuthSessionHelpers;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.LogoutServlet;
import io.hawt.web.auth.Redirector;
import io.quarkus.arc.Arc;

public class HawtioQuakusLogoutServlet extends LogoutServlet {

    @Override
    public void init() {
        Redirector redirector = Arc.container().instance(Redirector.class).get();
        setRedirector(redirector);
        super.init();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.logout();
        AuthSessionHelpers.clear(request, authConfiguration, false);
        redirector.doRedirect(request, response, AuthenticationConfiguration.LOGIN_URL);
    }
}
