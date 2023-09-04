package io.hawt.quarkus.filters;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicReference;

import javax.security.auth.Subject;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import io.hawt.quarkus.auth.HawtioQuarkusAuthenticator;
import io.hawt.system.AuthenticateResult;
import io.hawt.system.Authenticator;
import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.AuthSessionHelpers;
import io.hawt.web.auth.AuthenticationFilter;
import io.quarkus.arc.Arc;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Jolokia endpoint authentication filter for Quarkus.
 */
public class HawtioQuarkusAuthenticationFilter extends AuthenticationFilter {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioQuarkusAuthenticationFilter.class);

    private HawtioQuarkusAuthenticator authenticator;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        authenticator = Arc.container().instance(HawtioQuarkusAuthenticator.class).get();
        super.init(filterConfig);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getServletPath();

        LOG.debug("Handling request for path: {}", path);

        if (!authConfiguration.isEnabled() || authConfiguration.isKeycloakEnabled()) {
            LOG.debug("No authentication needed for path: {}", path);
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            Subject subject = (Subject) session.getAttribute("subject");

            // Connecting from another Hawtio may have a different user authentication, so
            // let's check if the session user is the same as in the authorization header here
            if (AuthSessionHelpers.validate(httpRequest, session, subject)) {
                chain.doFilter(request, response);
                return;
            }
        }

        LOG.debug("Doing authentication and authorization for path: {}", path);

        AtomicReference<String> username = new AtomicReference<>();
        AtomicReference<String> password = new AtomicReference<>();
        Authenticator.extractAuthHeader(httpRequest, (u, p) -> {
            username.set(u);
            password.set(p);
        });
        AuthenticateResult result = authenticator.authenticate(
            httpRequest, authConfiguration, username.get(), password.get());

        HttpServletResponse httpResponse = (HttpServletResponse) response;
        switch (result) {
        case AUTHORIZED:
            chain.doFilter(request, response);
            break;
        case NOT_AUTHORIZED:
            ServletHelpers.doForbidden(httpResponse);
            break;
        case NO_CREDENTIALS:
            if (authConfiguration.isNoCredentials401()) {
                // return auth prompt 401
                ServletHelpers.doAuthPrompt(authConfiguration.getRealm(), httpResponse);
            } else {
                // return forbidden 403 so the browser login does not popup
                ServletHelpers.doForbidden(httpResponse);
            }
            break;
        }
    }
}
