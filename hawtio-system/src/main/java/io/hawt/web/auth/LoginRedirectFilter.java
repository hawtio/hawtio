package io.hawt.web.auth;

import java.io.IOException;
import java.util.Arrays;

import io.hawt.util.Strings;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import io.hawt.system.AuthHelpers;
import io.hawt.system.AuthenticateResult;
import io.hawt.system.Authenticator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Redirect to login page when authentication is enabled. This filter also handles pre-emptive authentication
 * if relevant HTTP headers are found when accessing protected resources.
 */
public class LoginRedirectFilter implements Filter {

    private static final Logger LOG = LoggerFactory.getLogger(LoginRedirectFilter.class);

    public static final String ATTRIBUTE_UNSECURED_PATHS = "unsecuredPaths";

    private int timeout;
    private AuthenticationConfiguration authConfiguration;

    // paths which are either unsecured or are secured in different way (like AuthenticationFilter)
    private String[] unsecuredPaths;
    // base path for hawtio. Should be "/" for hawtio.war
    // and e.g., "/actuator/hawtio" for Spring Boot (configurable)
    private final String basePath;
    // base path including context path, which "/hawtio" for hawtio.war and may be anything
    // on Spring Boot with "server.servlet.context-path" or "management.server.base-path" properties
    private String baseFullPath;

    private Redirector redirector = new Redirector();

    public LoginRedirectFilter() {
        this(AuthenticationConfiguration.UNSECURED_PATHS, "/");
    }

    public LoginRedirectFilter(String[] unsecuredPaths, String hawtioBase) {
        this.unsecuredPaths = unsecuredPaths;
        this.basePath = Strings.cleanPath(hawtioBase);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        authConfiguration = AuthenticationConfiguration.getConfiguration(filterConfig.getServletContext());
        timeout = AuthSessionHelpers.getSessionTimeout(filterConfig.getServletContext());
        LOG.info("Hawtio loginRedirectFilter is using {} sec. HttpSession timeout", timeout);

        Object unsecured = filterConfig.getServletContext().getAttribute(ATTRIBUTE_UNSECURED_PATHS);
        if (unsecured != null) {
            unsecuredPaths = (String[]) unsecured;
        }
        baseFullPath = Strings.webContextPath(filterConfig.getServletContext().getContextPath(), basePath);
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpSession session = httpRequest.getSession(false);

        // TOCHECK: we may consider using this filter only for GET requests

        // req.getServletPath() should be for example "/jolokia" or "/index.html" or "/jmx" for WAR,
        // but for Spring Boot it includes path within DispatcherServlet, for example "/actuator/hawtio/jolokia"
        // that's why this.unsecuredPaths is processed with proper prefixes

        // for WAR, with welcome files configuration, "/" is already reflected as "/index.html" servlet path
        // in Tomcat. In Jetty it is still "/"
        String path = httpRequest.getServletPath();
        String requestURI = Strings.cleanPath(httpRequest.getRequestURI());
        String hawtioPath = requestURI.length() >= baseFullPath.length()
                ? requestURI.substring(baseFullPath.length()) : "";
        if (baseFullPath.equals(requestURI)) {
            // explicitly change to "/" for Tomcat, so it's redirected if not authenticated
            // for Spring Boot, "/actuator/hawtio" is changed to "/actuator/hawtio/", so we know it's top-level
            path = "/".equals(basePath) ? "/" : basePath + "/";
        }

        LOG.debug("Check if path [{}] requires redirect", path);

        // 1) skip redirect for no authentication or external authentication
        if (!authConfiguration.isEnabled()
                || authConfiguration.isKeycloakEnabled() || authConfiguration.isOidcEnabled()
                || AuthSessionHelpers.isSpringSecurityEnabled()) {
            if ("/login".equals(hawtioPath)) {
                // if the URL is /login (client-side router URL), we have to redirect to "/", so user doesn't see
                // login page blinking
                redirector.doRedirect(httpRequest, httpResponse, "/");
            } else {
                chain.doFilter(request, response);
            }
            return;
        }
        // 2) skip redirect, when already authenticated
        if (AuthSessionHelpers.isAuthenticated(session)) {
            if ("/login".equals(hawtioPath)) {
                // authenticated user should be redirected to "/"
                redirector.doRedirect(httpRequest, httpResponse, "/");
            } else {
                chain.doFilter(request, response);
            }
            return;
        }
        // 3) skip redirect, when accessing unsecured or specially-secured paths
        if (!isSecuredPath(path)) {
            if ("/login".equals(hawtioPath)) {
                // however if "/login" path is used (by explicit browser refresh) and user is not authenticated
                // we should forward to /index.html, so user doesn't get it with HTTP 404 (because of web.xml's
                // <error-code>404</error-code> + <location>/index.html</location>)
                redirector.doForward(httpRequest, httpResponse, "/index.html");
            } else {
                chain.doFilter(request, response);
            }
            return;
        }

        // 4) at this stage we have to redirect to /login, but we'll do preemptive authentication, so perhaps
        //    the redirect isn't needed
        //    this will give user "/login" address in URL bar and "/login" request which should end with
        //    forward to "/index.html"
        if (!tryAuthenticateRequest(httpRequest, session)) {
            redirector.doRedirect(httpRequest, httpResponse, AuthenticationConfiguration.LOGIN_URL);
            return;
        }

        // just proceed
        chain.doFilter(request, response);
    }

    /**
     * Preemptive authentication with side effects (storing subject and used within forcibly created session)
     *
     * @param request
     * @param session
     * @return
     */
    boolean tryAuthenticateRequest(HttpServletRequest request, HttpSession session) {
        AuthenticateResult result = new Authenticator(request, authConfiguration).authenticate(
            subject -> {
                String username = AuthHelpers.getUsername(subject);
                LOG.info("Logging in user: {}", username);
                AuthSessionHelpers.setup(session != null ? session :
                    request.getSession(true), subject, username, timeout);
            });

        return result.is(AuthenticateResult.Type.AUTHORIZED);
    }

    boolean isSecuredPath(String path) {
        return Arrays.stream(unsecuredPaths).noneMatch(path::startsWith);
    }

    public void setRedirector(Redirector redirector) {
        this.redirector = redirector;
    }
}
