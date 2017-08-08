package io.hawt.springboot;

import io.hawt.HawtioContextListener;
import io.hawt.web.AuthenticationFilter;
import io.hawt.web.CORSFilter;
import io.hawt.web.CacheHeadersFilter;
import io.hawt.web.ContextFormatterServlet;
import io.hawt.web.ExportContextServlet;
import io.hawt.web.GitServlet;
import io.hawt.web.JavaDocServlet;
import io.hawt.web.LoginServlet;
import io.hawt.web.LogoutServlet;
import io.hawt.web.ProxyServlet;
import io.hawt.web.RedirectFilter;
import io.hawt.web.SessionExpiryFilter;
import io.hawt.web.UploadServlet;
import io.hawt.web.XFrameOptionsFilter;
import io.hawt.web.XXSSProtectionFilter;
import io.hawt.web.keycloak.KeycloakServlet;
import io.hawt.web.keycloak.KeycloakUserServlet;
import org.apache.commons.fileupload.servlet.FileCleanerCleanup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.autoconfigure.ManagementContextConfiguration;
import org.springframework.boot.actuate.autoconfigure.ManagementServerProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;

/**
 * Management configuration for hawtio on Spring Boot
 */
@ManagementContextConfiguration
@EnableConfigurationProperties(HawtioProperties.class)
@PropertySource("classpath:/io/hawt/springboot/application.properties")
public class HawtioConfiguration {

    @Autowired
    private HawtioProperties hawtioProperties;

    @Autowired
    private ManagementServerProperties managementProperties;

    @Bean
    public HawtioEndpoint hawtioEndpoint() {
        return new HawtioEndpoint();
    }

    /**
     * Register rest endpoint to handle requests for /plugin, and
     * return all registered plugins.
     */
    @Bean
    public PluginService pluginService() {
        return new PluginService();
    }

    // -------------------------------------------------------------------------
    // Filters
    // -------------------------------------------------------------------------

    @Bean
    public FilterRegistrationBean redirectFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new RedirectFilter());
        filter.addUrlPatterns("/hawtio/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean sessionExpiryFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new SessionExpiryFilter());
        filter.addUrlPatterns("/hawtio/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean cacheFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new CacheHeadersFilter());
        filter.addUrlPatterns("/hawtio/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean corsFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new CORSFilter());
        filter.addUrlPatterns("/hawtio/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean xframeOptionsFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new XFrameOptionsFilter());
        filter.addUrlPatterns("/hawtio/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean xxssProtectionFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new XXSSProtectionFilter());
        filter.addUrlPatterns("/hawtio/*");
        return filter;
    }

    @Bean
    public FilterRegistrationBean authenticationFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new AuthenticationFilter());
        filter.addUrlPatterns(
            "/hawtio/auth/*",
            "/jolokia/*",
            "/hawtio/upload/*",
            "/hawtio/javadoc/*");
        return filter;
    }

    // -------------------------------------------------------------------------
    // Servlets
    // -------------------------------------------------------------------------

    // Jolokia agent servlet is provided by Spring Boot actuator

    @Bean
    public ServletRegistrationBean jolokiaProxyServlet() {
        return new ServletRegistrationBean(new ProxyServlet(),
            "/hawtio/proxy/*");
    }

    @Bean
    public ServletRegistrationBean fileUploadServlet() {
        return new ServletRegistrationBean(new UploadServlet(),
            "/hawtio/file-upload/*");
    }

    @Bean
    public ServletRegistrationBean userServlet() {
        return new ServletRegistrationBean(new KeycloakUserServlet(),
            "/user/*", "/hawtio/user/*");
    }

    @Bean
    public ServletRegistrationBean loginServlet() {
        return new ServletRegistrationBean(new LoginServlet(),
            "/hawtio/auth/login/*");
    }

    @Bean
    public ServletRegistrationBean logoutServlet() {
        return new ServletRegistrationBean(new LogoutServlet(),
            "/hawtio/auth/logout/*");
    }

    @Bean
    public ServletRegistrationBean keycloakServlet() {
        return new ServletRegistrationBean(new KeycloakServlet(),
            "/hawtio/keycloak/*");
    }

    @Bean
    public ServletRegistrationBean exportContextServlet() {
        return new ServletRegistrationBean(new ExportContextServlet(),
            "/hawtio/exportContext/*");
    }

    @Bean
    public ServletRegistrationBean gitServlet() {
        return new ServletRegistrationBean(new GitServlet(),
            "/hawtio/git/*");
    }

    @Bean
    public ServletRegistrationBean mavenSourceServlet() {
        return new ServletRegistrationBean(new JavaDocServlet(),
            "/hawtio/javadoc/*");
    }

    @Bean
    public ServletRegistrationBean contextFormatterServlet() {
        return new ServletRegistrationBean(new ContextFormatterServlet(),
            "/hawtio/contextFormatter/*");
    }

    // -------------------------------------------------------------------------
    // Listeners
    // -------------------------------------------------------------------------


    @Bean
    public ServletListenerRegistrationBean hawtioContextListener() {
        return new ServletListenerRegistrationBean<>(new HawtioContextListener());
    }

    @Bean
    public ServletListenerRegistrationBean fileCleanerCleanupListener() {
        return new ServletListenerRegistrationBean<>(new FileCleanerCleanup());
    }

}
