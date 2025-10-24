package io.hawt.web.auth;

import java.io.IOException;
import java.util.Arrays;

import io.hawt.web.ServletHelpers;
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

import static io.hawt.web.filters.BaseTagHrefFilter.PARAM_APPLICATION_CONTEXT_PATH;

/**
 * <p>A filter that handles client-side routing URLs and redirects to login page depending on authentication state.
 * There are two kinds of URLs handled:<ul>
 *     <li>URLs that correspond to Hawtio resources and servlets</li>
 *     <li>URLs that correspond to Hawtio-React client routes (which would give HTTP/404 when handled)</li>
 * </ul></p>
 *
 * <p>Special client route is {@code /login}, which should be handled carefuly and in some cases user may get
 * redirected to this URL for smoother client experience (no React app blinking).</p>
 *
 * <p>This filter should be called after {@link AuthenticationFilter}, but for requests not handled by that
 * filter, we may perform pre-emptive authentication.</p>
 *
 * <p>This filter used to be called {@code LoginRedirectFilter}, but it's doing a bit more now to provide unified
 * experience between WAR, Spring Boot and Quarkus deployments.</p>
 *
 * <p>Even in Spring Boot, this filter is called before {@code DispatcherServlet}, so it's invoked before
 * any {@code @RequestMapping} methods.</p>
 */
public class ClientRouteRedirectFilter implements Filter {

    private static final Logger LOG = LoggerFactory.getLogger(ClientRouteRedirectFilter.class);

    public static final String ATTRIBUTE_UNSECURED_PATHS = "unsecuredPaths";

    private int timeout;
    private AuthenticationConfiguration authConfiguration;

    /**
     * Paths which are either unsecured or are secured in different way (like AuthenticationFilter)
     */
    private String[] unsecuredPaths;

    /**
     * Base path for hawtio. Should be "/" for hawtio.war
     * and e.g., "/actuator/hawtio" for Spring Boot (configurable)
     */
    private final String basePath;

    /**
     * Base path including context path, which is "/hawtio" for hawtio.war (or "/console" for console.war)
     * and may be anything on Spring Boot with "server.servlet.context-path" or
     * "management.server.base-path" properties
     */
    private String baseFullPath;

    /**
     * Only the context path - /hawtio for hawtio.war and value from
     * server.servlet.context-path or management.server.base-path properties on Spring Boot.
     */
    private String contextPath;

    private Redirector redirector = new Redirector();

    public ClientRouteRedirectFilter() {
        this(AuthenticationConfiguration.UNSECURED_PATHS, "/");
    }

    public ClientRouteRedirectFilter(String[] unsecuredPaths, String hawtioBase) {
        this.unsecuredPaths = unsecuredPaths;
        this.basePath = ServletHelpers.cleanPath(hawtioBase);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        authConfiguration = AuthenticationConfiguration.getConfiguration(filterConfig.getServletContext());
        timeout = AuthSessionHelpers.getSessionTimeout(filterConfig.getServletContext());
        LOG.info("Hawtio ClientRouteRedirectFilter is using {} sec. HttpSession timeout", timeout);

        Object unsecured = filterConfig.getServletContext().getAttribute(ATTRIBUTE_UNSECURED_PATHS);
        if (unsecured != null) {
            unsecuredPaths = (String[]) unsecured;
        }
        contextPath = filterConfig.getServletContext().getContextPath();
        baseFullPath = ServletHelpers.webContextPath(contextPath, basePath);
        String appContextPath = filterConfig.getInitParameter(PARAM_APPLICATION_CONTEXT_PATH);
        if (appContextPath != null && !appContextPath.isEmpty()) {
            // Quarkus doesn't have any context path, but we still need to have /hawtio base
            baseFullPath = ServletHelpers.cleanPath(appContextPath);
        }
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpSession session = httpRequest.getSession(false);

        // TOCHECK: we may consider using this filter only for GET requests

        // this is full path, which includes context path and path info
        String requestURI = ServletHelpers.cleanPath(httpRequest.getRequestURI());
        // this is a path without context path and should be everything after "/hawtio" (or "/actuator/hawtio")
        String hawtioPath = requestURI.length() < baseFullPath.length() ? ""
                : requestURI.substring(baseFullPath.length());
        // this is a path after context path:
        //  - everything after /hawtio for hawtio.war
        //  - everything after /actuator/hawtio for default Spring Boot config. but also handles cases with custom
        //    management base and/or mapping and if same port is used for main and management server, then dispatcher
        //    servlet's base path is also handled (and this is the case why we CAN'T use req.getServletPath())
        String path = requestURI.length() < contextPath.length() ? ""
                : requestURI.substring(contextPath.length());

        boolean loginPage = hawtioPath.startsWith("/login");

        if (baseFullPath.equals(requestURI)) {
            // explicitly change to "/" for Tomcat, so it's redirected if not authenticated
            // for Spring Boot, "/actuator/hawtio" is changed to "/actuator/hawtio/", so we know it's top-level
            path = "/".equals(basePath) ? "/" : basePath + "/";
        }

        LOG.debug("Check if path [{}] requires redirect", path);

        // 0) whatever the configuration, accessing css, index.html, fonts, ..., should be handled normally
        //    this is also true for some special URLs like /jolokia/* or /proxy/* which are processed by
        //    other filters (like AuthenticationFilter)
        if (!loginPage && !isSecuredPath(path)) {
            chain.doFilter(request, response);
            return;
        }

        // "/login" is similar to URLs like "/connect/remote" or "/jmx", because it's client-side router URL
        // but it should be handled differently
        // "/" (and even "") are also treated as client-side routes, because there's no path among
        // io.hawt.web.auth.AuthenticationConfiguration.UNSECURED_PATHS that "/" startsWith()

        // 1) no authentication or external authentication
        if (!authConfiguration.isEnabled() || authConfiguration.isExternalAuthenticationEnabled()) {
            if (loginPage) {
                // /login should be redirected to "/", so user doesn't see login page blinking
                redirector.doRedirect(httpRequest, httpResponse, "/");
            } else {
                // other client-side router URLs should be forwarded to /index.html
                // and it should be done here, not with:
                // 1) <error-code>404</error-code> + <location>/index.html</location> hack for WAR
                // 2) io.hawt.springboot.HawtioEndpoint.forwardHawtioRequestToIndexHtml() for SpringBoot (RegExp)
                // 3) io.hawt.quarkus.filters.HawtioQuarkusPathFilter.doFilter() for Quarkus (RegExp)
                redirector.doForward(httpRequest, httpResponse, "/index.html");
            }
            return;
        }

        // 2) when already authenticated - the same as #1, but please leave for clarity
        if (AuthSessionHelpers.isAuthenticated(session)) {
            if (loginPage) {
                // /login should be redirected to "/", so authenticated user doesn't see login page blinking
                redirector.doRedirect(httpRequest, httpResponse, "/");
            } else {
                // other client-side router URLs should be forwarded to /index.html
                redirector.doForward(httpRequest, httpResponse, "/index.html");
            }
            return;
        }

        // 3) not authenticated access to /login - forward to /index.html to get the login page displayed by React
        if (loginPage) {
            redirector.doForward(httpRequest, httpResponse, "/index.html");
            return;
        }

        // try pre-emptive authentication, so when user sees index.html page (Hawtio client), jolokia requests
        // will already be authenticated.
        // authentication attempt will be made only for "secure" paths which are paths like /hawtio/jmx.
        //  - /hawtio/jolokia/*, /hawtio/proxy/* are handled and authenticated by AuthenticationFilter in case #0
        //  - /hawtio/css/*, /hawtio/index.html, ... are not authenticated and are handled in case #0
        AuthenticateResult.Type preemptiveAuthResult = tryAuthenticateRequest(httpRequest, session);

        // 4) at this stage we have to redirect to /login if authentication failed
        if (preemptiveAuthResult != AuthenticateResult.Type.AUTHORIZED) {
            // redirect to login page - no other option. Actually later we're forwarded to /index.html
            // but user sees /login in URL, so it's good

            if (preemptiveAuthResult != AuthenticateResult.Type.NOT_AUTHORIZED) {
                // this is usually normal - user browses to Hawtio for the first time
                redirector.doRedirect(httpRequest, httpResponse, AuthenticationConfiguration.LOGIN_URL);
            } else {
                // NOT_AUTHORIZED means there WAS an authentication attempt (for example with certificate login)
                // so we have to tell client-side login page that there was some kind of failure
                // (without providing too many details)
                redirector.doRedirect(httpRequest, httpResponse, AuthenticationConfiguration.LOGIN_URL + "#noauth");
            }
            return;
        }

        // 5) we're authenticated pre-emptively - so the same situation as #2.b. This is a case when authenticated
        //    user simply refreshes a page like http://localhost:8080/hawtio/jmx
        redirector.doForward(httpRequest, httpResponse, "/index.html");
    }

    /**
     * Preemptive authentication with side effects (storing subject and username within forcibly created session)
     *
     * @param request
     * @param session
     * @return
     */
    AuthenticateResult.Type tryAuthenticateRequest(HttpServletRequest request, HttpSession session) {
        AuthenticateResult result = new Authenticator(request, authConfiguration).authenticate(
            subject -> {
                String username = AuthHelpers.getUsername(authConfiguration, subject);
                LOG.info("Logging in user: {}", username);
                AuthSessionHelpers.setup(session != null ? session :
                    request.getSession(true), subject, username, timeout);
            });

        return result.getType();
    }

    /**
     * "Secured path" means it's not one of resources paths (css, js, images, fonts, index.html itself, ...) but
     * it's also not a "specially protected path" (/jolokia, /proxy, /auth, ...). It means that all
     * "client-side routes" are "secured" (like /jmx, /connect/remote, ...).
     * Mind that "/login" is one of such client-side secured routes/paths, but it's handled in special way.
     *
     * @param path
     * @return
     */
    boolean isSecuredPath(String path) {
        return Arrays.stream(unsecuredPaths).noneMatch(path::startsWith);
    }

    public void setRedirector(Redirector redirector) {
        this.redirector = redirector;
    }
}
