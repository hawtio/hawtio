package io.hawt.springboot;

import io.hawt.system.ConfigManager;
import io.hawt.web.auth.AuthConfigurationServlet;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.AuthenticationFilter;
import io.hawt.web.auth.ClientRouteRedirectFilter;
import io.hawt.web.auth.LoginServlet;
import io.hawt.web.auth.LogoutServlet;
import io.hawt.web.auth.Redirector;
import io.hawt.web.auth.SessionExpiryFilter;
import io.hawt.web.auth.keycloak.KeycloakServlet;
import io.hawt.web.auth.keycloak.KeycloakUserServlet;
import io.hawt.web.filters.BaseTagHrefFilter;
import io.hawt.web.filters.FlightRecordingDownloadFacade;
import io.hawt.web.filters.ResponseHeadersFilter;
import io.hawt.web.proxy.ProxyServlet;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jolokia.support.spring.actuator.JolokiaServletAutoConfiguration;
import org.jolokia.support.spring.actuator.JolokiaWebEndpoint;
import org.jolokia.support.spring.actuator.JolokiaWebEndpointAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.endpoint.condition.ConditionalOnAvailableEndpoint;
import org.springframework.boot.actuate.autoconfigure.endpoint.expose.EndpointExposure;
import org.springframework.boot.actuate.autoconfigure.web.ManagementContextConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBooleanProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.SimpleUrlHandlerMapping;
import org.springframework.web.servlet.mvc.AbstractController;
import org.springframework.web.servlet.mvc.AbstractUrlViewController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static io.hawt.web.filters.BaseTagHrefFilter.PARAM_APPLICATION_CONTEXT_PATH;

/**
 * <p>This autoconfiguration class for <em>management context</em> registers required servlets and filters
 * for Hawtio web application based on Spring MVC.</p>
 */
@ManagementContextConfiguration
@AutoConfigureAfter({ JolokiaServletAutoConfiguration.class, JolokiaWebEndpointAutoConfiguration.class })
@ConditionalOnBean({ HawtioEndpoint.class, EndpointPathResolver.class })
@ConditionalOnBooleanProperty(value = "hawtio.enabled", havingValue = true, matchIfMissing = true)
public class HawtioManagementConfiguration {

    // a path within Spring server or management server that's the "base" of Hawtio actuator.
    // By default it should be "/actuator/hawtio", but may be affected by application.properties settings
    // (for example management.endpoints.web.base-path which defaults to "/actuator", but can be customized)
    private final String hawtioPath;

    public HawtioManagementConfiguration(final EndpointPathResolver pathResolver) {
        this.hawtioPath = pathResolver.resolve("hawtio");
    }

    /**
     * Configuration manager bean that exposes Spring property sources (most importantly from
     * {@code application.properties}) to Hawtio application
     * @param hawtioProperties
     * @return
     */
    @Bean
    public ConfigManager hawtioConfigManager(final HawtioProperties hawtioProperties) {
        return new ConfigManager(hawtioProperties.get()::get);
    }

    /**
     * {@link org.springframework.web.servlet.config.annotation.WebMvcConfigurer MVC configurer} that
     * registers static resource location for Hawtio resources (JS, images, styles, ...) using dynamic URL mapping.
     * @param pathResolver
     * @return
     */
    @Bean
    public HawtioWebMvcConfigurer hawtioWebMvcConfigurer(final EndpointPathResolver pathResolver) {
        return new HawtioWebMvcConfigurer(pathResolver);
    }

    /**
     * Spring version of {@code web.xml}'s {@code <welcome-files>}, to make redirects/forwards consistent with WAR
     * and Quarkus deployments.
     * @param pathResolver
     * @return
     */
    @Bean
    public SimpleUrlHandlerMapping hawtioWelcomeFiles(final EndpointPathResolver pathResolver) {
        AbstractController abstractController = new AbstractController() {
            @Override
            protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) {
                return new ModelAndView("forward:" + pathResolver.resolve("hawtio") + "/index.html");
            }
        };
        // https://github.com/hawtio/hawtio/issues/3382
        // order=10 to handle "/actuator/hawtio/" URL as forward to "/actuator/hawtio/index.html" for consistency
        return new SimpleUrlHandlerMapping(Map.of(pathResolver.resolve("hawtio") + "/", abstractController), 10);
    }

    /**
     * <p>{@link HandlerMapping} that <em>forwards</em> requests in the form of {@code /actuator/hawtio/jolokia}
     * to actual Jolokia actuator endpoint normally registered under {@code /actuator/jolokia}.</p>
     *
     * <p>Jolokia's {@link org.jolokia.server.core.http.AgentServlet} is registered dynamically by
     * {@link org.jolokia.support.spring.actuator.JolokiaServletRegistration#onStartup}.</p>
     *
     * <p>Note: With WAR deployment this is not required, because Hawtio's {@code web.xml} registers own version
     * of Jolokia's {@link org.jolokia.server.core.http.AgentServlet}.</p>
     *
     * @param pathResolver
     * @return
     */
    @Bean
    @ConditionalOnBean(JolokiaWebEndpoint.class)
    @ConditionalOnAvailableEndpoint(value = JolokiaWebEndpoint.class, exposure = EndpointExposure.WEB)
    public SimpleUrlHandlerMapping hawtioUrlMapping(final EndpointPathResolver pathResolver) {
        final String jolokiaPath = pathResolver.resolve("jolokia");
        final String hawtioPath = pathResolver.resolve("hawtio");

        final SilentSimpleUrlHandlerMapping mapping = new SilentSimpleUrlHandlerMapping();
        final Map<String, Object> urlMap = new HashMap<>();

        if (!hawtioPath.isEmpty()) {
            final String hawtioJolokiaPath = pathResolver.resolveUrlMapping("hawtio", "jolokia", "**");
            urlMap.put(
                hawtioJolokiaPath,
                new JolokiaForwardingController(hawtioPath + "/jolokia", jolokiaPath));
            mapping.setOrder(Ordered.HIGHEST_PRECEDENCE);
        } else {
            urlMap.put(SilentSimpleUrlHandlerMapping.DUMMY, null);
        }

        mapping.setUrlMap(urlMap);
        return mapping;
    }

    // -------------------------------------------------------------------------
    // Redirect Helper
    // -------------------------------------------------------------------------

    @Bean
    public Redirector redirector() {
        final Redirector redirector = new Redirector();
        redirector.setApplicationContextPath(hawtioPath);
        return redirector;
    }

    // -------------------------------------------------------------------------
    // Filters
    // -------------------------------------------------------------------------

    // use @Order annotation to ensure filter mapping as in web.xml. method invocation order _may_ be JVM dependent

    /**
     * Since Spring Boot 3.0, paths with trailing slash are not automatically processed
     * and need to be explicitly configured for handling them. This Spring Boot
     * specific filter used to redirect {@code /actuator/hawtio/} requests to {@code /actuator/hawtio/index.html},
     * but now it used for consistency with WAR deployments - to redirect {@code /actuator/hawtio} to
     * {@code /actuator/hawtio/}. Then the request is being processed by {@link ClientRouteRedirectFilter}.
     */
    @Bean
    @Order(0)
    public FilterRegistrationBean<TrailingSlashFilter> trailingSlashFilter(final Redirector redirector) {
        final FilterRegistrationBean<TrailingSlashFilter> filter = new FilterRegistrationBean<>();
        filter.setFilter(new TrailingSlashFilter(redirector));
        filter.addUrlPatterns(hawtioPath);
        return filter;
    }

    // Filters registered in the same order as in web.xml for WAR deployment

    @Bean
    @Order(1)
    public FilterRegistrationBean<SessionExpiryFilter> sessionExpiryFilter() {
        final FilterRegistrationBean<SessionExpiryFilter> filter = new FilterRegistrationBean<>();
        filter.setFilter(new SessionExpiryFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    @Order(2)
    public FilterRegistrationBean<ResponseHeadersFilter> responseHeadersFilter() {
        final FilterRegistrationBean<ResponseHeadersFilter> filter = new FilterRegistrationBean<>();
        filter.setFilter(new ResponseHeadersFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    // note on io.hawt.web.auth.AuthenticationFilter
    // /actuator/hawtio/jolokia/* requests are forwarded to /actuator/jolokia/* using
    // io.hawt.springboot.HawtioManagementConfiguration.JolokiaForwardingController which returns
    // "forward:/actuator/jolokia" view name handled by DispatcherServlet. Such request (with original URI
    // /actuator/hawtio/jolokia/*) is already handled by all the above Hawtio filters, so there's NO NEED
    // to map "/hawtio/jolokia/*" pattern to AuthenticationFilter, because filters will be invoked during the forward
    //
    // when using /actuator/jolokia/* request, we invoke Jolokia Actuator endpoint directly and NO Hawtio filters
    // will be invoked (which is fine), but we need AuthenticationFilter being mapped to "/actuator/jolokia/*"

    /**
     * <p>{@link AuthenticationFilter} handling direct Jolokia Actuator endpoint requests ({@code /actuator/jolokia/*})
     * and proxy requests ({@code /actuator/hawtio/proxy/*})</p>
     *
     * <p>{@code /actuator/hawtio/jolokia/*} is forwarded to {@code /actuator/jolokia/*} using
     * {@link JolokiaForwardingController}.</p>
     *
     * @param pathResolver
     * @return
     */
    @Bean
    @Order(11)
    @ConditionalOnBean(JolokiaWebEndpoint.class)
    @ConditionalOnAvailableEndpoint(value = JolokiaWebEndpoint.class, exposure = EndpointExposure.WEB)
    public FilterRegistrationBean<AuthenticationFilter> jolokiaAuthenticationFilter(final EndpointPathResolver pathResolver) {
        final FilterRegistrationBean<AuthenticationFilter> filter = new FilterRegistrationBean<>();
        // same filter instance for two path patterns
        filter.setFilter(new AuthenticationFilter());
        filter.addUrlPatterns(pathResolver.resolveUrlMapping("jolokia", "*"));
        filter.addUrlPatterns(hawtioPath + "/proxy/*");
        filter.setDispatcherTypes(DispatcherType.ERROR, DispatcherType.FORWARD, DispatcherType.REQUEST);
        return filter;
    }

    /**
     * This filter was called {@code LoginRedirectFilter}, but now it also handles redirection/forwarding for
     * client-side routes (React Router).
     *
     * @param redirector
     * @param pathResolver
     * @return
     */
    @Bean
    @Order(12)
    public FilterRegistrationBean<ClientRouteRedirectFilter> clientRouteRedirectFilter(final Redirector redirector,
            EndpointPathResolver pathResolver) {
        final String[] unsecuredPaths = prependContextPath(AuthenticationConfiguration.UNSECURED_PATHS);
        final FilterRegistrationBean<ClientRouteRedirectFilter> filter = new FilterRegistrationBean<>();
        final ClientRouteRedirectFilter clientRouteRedirectFilter = new ClientRouteRedirectFilter(unsecuredPaths, pathResolver.resolve("hawtio"));
        clientRouteRedirectFilter.setRedirector(redirector);
        filter.setFilter(clientRouteRedirectFilter);
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    @Order(13)
    public FilterRegistrationBean<BaseTagHrefFilter> baseTagHrefFilter(final EndpointPathResolver pathResolver) {
        final FilterRegistrationBean<BaseTagHrefFilter> filter = new FilterRegistrationBean<>();
        final BaseTagHrefFilter baseTagHrefFilter = new BaseTagHrefFilter();
        filter.setFilter(baseTagHrefFilter);
        filter.addUrlPatterns(hawtioPath + "/");
        filter.addUrlPatterns(hawtioPath + "/index.html");
        filter.setDispatcherTypes(DispatcherType.ERROR, DispatcherType.FORWARD, DispatcherType.REQUEST);
        filter.addInitParameter(PARAM_APPLICATION_CONTEXT_PATH, pathResolver.resolve("hawtio"));
        return filter;
    }

    @Bean
    @Order(14)
    public FilterRegistrationBean<FlightRecordingDownloadFacade> flightRecorderDownloadFacade(final EndpointPathResolver pathResolver) {
        final FilterRegistrationBean<FlightRecordingDownloadFacade> filter = new FilterRegistrationBean<>();
        filter.setFilter(new FlightRecordingDownloadFacade());
        filter.addUrlPatterns(hawtioPath + "/jolokia/*");
        filter.addUrlPatterns(hawtioPath + "/proxy/*");
        filter.setDispatcherTypes(DispatcherType.ERROR, DispatcherType.FORWARD, DispatcherType.REQUEST);
        return filter;
    }

    // -------------------------------------------------------------------------
    // Servlets
    // -------------------------------------------------------------------------

    // Jolokia agent servlet is provided by Spring Boot actuator, so there's no need to register it here

    @Bean
    public ServletRegistrationBean<ProxyServlet> jolokiaProxyServlet() {
        ServletRegistrationBean<ProxyServlet> registration = new ServletRegistrationBean<>(
                new ProxyServlet(),
                hawtioPath + "/proxy/*");
        registration.addInitParameter("proxyAllowlist", "localhost, 127.0.0.1");
        return registration;
    }

    @Bean
    public ServletRegistrationBean<KeycloakUserServlet> userServlet() {
        return new ServletRegistrationBean<>(
            new KeycloakUserServlet(),
            hawtioPath + "/user/*");
    }

    @Bean
    public ServletRegistrationBean<LoginServlet> loginServlet(Redirector redirector) {
        LoginServlet loginServlet = new LoginServlet();
        loginServlet.setRedirector(redirector);
        return new ServletRegistrationBean<>(loginServlet,
            hawtioPath + "/auth/login");
    }

    @Bean
    public ServletRegistrationBean<LogoutServlet> logoutServlet(Redirector redirector) {
        LogoutServlet logoutServlet = new LogoutServlet();
        logoutServlet.setRedirector(redirector);
        return new ServletRegistrationBean<>(logoutServlet,
            hawtioPath + "/auth/logout");
    }

    @Bean
    public ServletRegistrationBean<KeycloakServlet> keycloakServlet() {
        return new ServletRegistrationBean<>(
            new KeycloakServlet(),
            hawtioPath + "/keycloak/*");
    }

    @Bean
    public ServletRegistrationBean<AuthConfigurationServlet> oidcServlet() {
        return new ServletRegistrationBean<>(
            new AuthConfigurationServlet(hawtioPath),
            hawtioPath + "/auth/config/*");
    }

    // -------------------------------------------------------------------------
    // Listeners
    // -------------------------------------------------------------------------

    @Bean
    public ServletListenerRegistrationBean<SpringHawtioContextListener> hawtioContextListener(final ConfigManager configManager) {
        return new ServletListenerRegistrationBean<>(
            new SpringHawtioContextListener(configManager, hawtioPath));
    }

    // -------------------------------------------------------------------------
    // Session Config
    // -------------------------------------------------------------------------

    @Bean
    public ServletContextInitializer servletContextInitializer() {
        return servletContext -> servletContext.getSessionCookieConfig().setHttpOnly(true);
    }

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    private String[] prependContextPath(String[] paths) {
        return Arrays.stream(paths)
            .map(path -> hawtioPath + path)
            .toArray(String[]::new);
    }

    private static class JolokiaForwardingController extends AbstractUrlViewController {

        private final String hawtioJolokiaPath;
        private final String jolokiaPath;

        JolokiaForwardingController(final String hawtioJolokiaPath, final String jolokiaPath) {
            this.hawtioJolokiaPath = hawtioJolokiaPath;
            this.jolokiaPath = jolokiaPath;
        }

        @Override
        protected String getViewNameForRequest(final HttpServletRequest request) {
            // Forward requests from hawtio/jolokia to the Spring Boot Jolokia actuator endpoint
            final StringBuilder b = new StringBuilder();
            b.append("forward:");
            b.append(jolokiaPath);
            final String pathQuery = request.getRequestURI().substring(
                request.getContextPath().length() + hawtioJolokiaPath.length());
            b.append(pathQuery);
            if (request.getQueryString() != null) {
                b.append('?').append(request.getQueryString());
            }
            return b.toString();
        }
    }

    // Does not warn when no mappings are present
    private static class SilentSimpleUrlHandlerMapping extends SimpleUrlHandlerMapping {
        private static final String DUMMY = "/<DUMMY>";

        @Override
        public void registerHandler(final String urlPath, final Object handler) {
            if (!DUMMY.equals(urlPath)) {
                super.registerHandler(urlPath, handler);
            }
        }
    }

}
