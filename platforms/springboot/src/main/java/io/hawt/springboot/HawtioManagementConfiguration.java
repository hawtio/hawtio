package io.hawt.springboot;

import io.hawt.system.ConfigManager;
import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.AuthenticationFilter;
import io.hawt.web.auth.LoginRedirectFilter;
import io.hawt.web.auth.LoginServlet;
import io.hawt.web.auth.LogoutServlet;
import io.hawt.web.auth.Redirector;
import io.hawt.web.auth.SessionExpiryFilter;
import io.hawt.web.auth.keycloak.KeycloakServlet;
import io.hawt.web.auth.keycloak.KeycloakUserServlet;
import io.hawt.web.filters.BaseTagHrefFilter;
import io.hawt.web.filters.CORSFilter;
import io.hawt.web.filters.CacheHeadersFilter;
import io.hawt.web.filters.ContentSecurityPolicyFilter;
import io.hawt.web.filters.PublicKeyPinningFilter;
import io.hawt.web.filters.StrictTransportSecurityFilter;
import io.hawt.web.filters.XContentTypeOptionsFilter;
import io.hawt.web.filters.XFrameOptionsFilter;
import io.hawt.web.filters.XXSSProtectionFilter;
import io.hawt.web.proxy.ProxyServlet;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.servlet.DispatcherType;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.autoconfigure.jolokia.JolokiaEndpoint;
import org.springframework.boot.actuate.autoconfigure.jolokia.JolokiaEndpointAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.web.ManagementContextConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.handler.SimpleUrlHandlerMapping;
import org.springframework.web.servlet.mvc.AbstractUrlViewController;
import static io.hawt.web.filters.BaseTagHrefFilter.PARAM_APPLICATION_CONTEXT_PATH;

@ManagementContextConfiguration
@AutoConfigureAfter(JolokiaEndpointAutoConfiguration.class)
@ConditionalOnBean(HawtioEndpoint.class)
public class HawtioManagementConfiguration {

    private final String hawtioPath;

    public HawtioManagementConfiguration (final EndpointPathResolver pathResolver) {
        this.hawtioPath = pathResolver.resolve("hawtio");
    }

    @Autowired
    public void initializeHawtioPlugins(final HawtioEndpoint hawtioEndpoint, final Optional<List<HawtPlugin>> plugins) {
        hawtioEndpoint.setPlugins(plugins.orElse(Collections.emptyList()));
    }

    @Bean
    public ConfigManager hawtioConfigManager(final HawtioProperties hawtioProperties) {
        return new ConfigManager(hawtioProperties.get()::get);
    }

    @Bean
    @ConditionalOnBean(JolokiaEndpoint.class)
    @ConditionalOnExposedEndpoint(name = "jolokia")
    public SimpleUrlHandlerMapping hawtioUrlMapping(final EndpointPathResolver pathResolver) {
        final String jolokiaPath = pathResolver.resolve("jolokia");
        final String hawtioPath = pathResolver.resolve("hawtio");

        final SilentSimpleUrlHandlerMapping mapping = new SilentSimpleUrlHandlerMapping();
        final Map<String, Object> urlMap = new HashMap<>();

        if (!hawtioPath.isEmpty()) {
            final String hawtioJolokiaPath = pathResolver.resolveUrlMapping("hawtio", "jolokia", "**");
            urlMap.put(hawtioJolokiaPath, new JolokiaForwardingController(jolokiaPath));
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


    @Bean
    public FilterRegistrationBean sessionExpiryFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new SessionExpiryFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean cacheFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new CacheHeadersFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean hawtioCorsFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new CORSFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean xframeOptionsFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new XFrameOptionsFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean xxssProtectionFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new XXSSProtectionFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean xContentTypeOptionsFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new XContentTypeOptionsFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean contentSecurityPolicyFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new ContentSecurityPolicyFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean strictTransportSecurityFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new StrictTransportSecurityFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean publicKeyPinningFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new PublicKeyPinningFilter());
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    @ConditionalOnBean(JolokiaEndpoint.class)
    @ConditionalOnExposedEndpoint(name = "jolokia")
    public FilterRegistrationBean authenticationFilter(final EndpointPathResolver pathResolver) {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new AuthenticationFilter());
        filter.addUrlPatterns(pathResolver.resolveUrlMapping("jolokia", "*"));
        filter.setDispatcherTypes(DispatcherType.ERROR, DispatcherType.FORWARD, DispatcherType.REQUEST);
        return filter;
    }

    @Bean
    public FilterRegistrationBean loginRedirectFilter(final Redirector redirector) {
        final String[] unsecuredPaths = prependContextPath(AuthenticationConfiguration.UNSECURED_PATHS);
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        final LoginRedirectFilter loginRedirectFilter = new LoginRedirectFilter(unsecuredPaths);
        loginRedirectFilter.setRedirector(redirector);
        filter.setFilter(loginRedirectFilter);
        filter.addUrlPatterns(hawtioPath + "/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean baseTagHrefFilter(final EndpointPathResolver pathResolver) {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        final BaseTagHrefFilter baseTagHrefFilter = new BaseTagHrefFilter();
        filter.setFilter(baseTagHrefFilter);
        filter.addUrlPatterns(hawtioPath + "/");
        filter.addUrlPatterns(hawtioPath + "/index.html");
        filter.addUrlPatterns(hawtioPath + "/login.html");
        filter.setDispatcherTypes(DispatcherType.ERROR, DispatcherType.FORWARD, DispatcherType.REQUEST);
        filter.addInitParameter(PARAM_APPLICATION_CONTEXT_PATH, pathResolver.resolve("hawtio"));
        return filter;
    }

    // -------------------------------------------------------------------------
    // Servlets
    // -------------------------------------------------------------------------

    // Jolokia agent servlet is provided by Spring Boot actuator

    @Bean
    public ServletRegistrationBean jolokiaProxyServlet() {
        return new ServletRegistrationBean(
            new ProxyServlet(),
            hawtioPath + "/proxy/*");
    }

    @Bean
    public ServletRegistrationBean userServlet() {
        return new ServletRegistrationBean(
            new KeycloakUserServlet(),
            hawtioPath + "/user/*");
    }

    @Bean
    public ServletRegistrationBean loginServlet(Redirector redirector) {
        LoginServlet loginServlet = new LoginServlet();
        loginServlet.setRedirector(redirector);
        return new ServletRegistrationBean(loginServlet,
            hawtioPath + "/auth/login");
    }

    @Bean
    public ServletRegistrationBean logoutServlet(Redirector redirector) {
        LogoutServlet logoutServlet = new LogoutServlet();
        logoutServlet.setRedirector(redirector);
        return new ServletRegistrationBean(logoutServlet,
            hawtioPath + "/auth/logout");
    }

    @Bean
    public ServletRegistrationBean keycloakServlet() {
        return new ServletRegistrationBean(
            new KeycloakServlet(),
            hawtioPath + "/keycloak/*");
    }

    // -------------------------------------------------------------------------
    // Listeners
    // -------------------------------------------------------------------------

    @Bean
    public ServletListenerRegistrationBean<?> hawtioContextListener(final ConfigManager configManager) {
        return new ServletListenerRegistrationBean<>(
            new SpringHawtioContextListener(configManager, hawtioPath));
    }

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    private String[] prependContextPath(String[] paths) {
        return Arrays.stream(paths)
            .map(path -> hawtioPath + path)
            .toArray(String[]::new);
    }

    private class JolokiaForwardingController extends AbstractUrlViewController {

        private final String jolokiaPath;

        JolokiaForwardingController(final String jolokiaPath) {
            this.jolokiaPath = jolokiaPath;
        }

        @Override
        protected String getViewNameForRequest(final HttpServletRequest request) {
            // Forward requests from hawtio/jolokia to the Spring Boot Jolokia actuator endpoint
            final StringBuilder b = new StringBuilder();
            b.append("forward:");
            b.append(jolokiaPath);
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
        protected void registerHandler(final String urlPath, final Object handler) {
            if (!DUMMY.equals(urlPath)) {
                super.registerHandler(urlPath, handler);
            }
        }
    }
}
