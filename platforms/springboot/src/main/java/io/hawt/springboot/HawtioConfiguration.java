package io.hawt.springboot;

import io.hawt.HawtioContextListener;
import io.hawt.web.auth.AuthenticationFilter;
import io.hawt.web.auth.LoginServlet;
import io.hawt.web.auth.LogoutServlet;
import io.hawt.web.filters.CORSFilter;
import io.hawt.web.filters.CacheHeadersFilter;
import io.hawt.web.filters.RedirectFilter;
import io.hawt.web.filters.SessionExpiryFilter;
import io.hawt.web.filters.XFrameOptionsFilter;
import io.hawt.web.filters.XXSSProtectionFilter;
import io.hawt.web.keycloak.KeycloakServlet;
import io.hawt.web.keycloak.KeycloakUserServlet;
import io.hawt.web.proxy.ProxyServlet;
import io.hawt.web.servlets.ContextFormatterServlet;
import io.hawt.web.servlets.ExportContextServlet;
import io.hawt.web.servlets.GitServlet;
import io.hawt.web.servlets.JavaDocServlet;
import io.hawt.web.servlets.UploadServlet;
import org.apache.commons.fileupload.servlet.FileCleanerCleanup;
import org.springframework.boot.actuate.autoconfigure.ManagementContextConfiguration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * Management configuration for hawtio on Spring Boot
 */
@ManagementContextConfiguration
@ConfigurationProperties(prefix = "hawtio")
public class HawtioConfiguration extends WebMvcConfigurerAdapter {

    @Override
    public void addResourceHandlers(final ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/hawtio/plugins/**").addResourceLocations("/app/", "classpath:/hawtio-static/app/");
        registry.addResourceHandler("/hawtio/**").addResourceLocations("/", "/app/", "classpath:/hawtio-static/",
            "classpath:/hawtio-static/app/");
        registry.addResourceHandler("/img/**").addResourceLocations("classpath:/hawtio-static/img/");
    }

    @Override
    public void addViewControllers(final ViewControllerRegistry registry) {
        registry.addViewController("/hawtio/plugin").setViewName("forward:/plugin");
        registry.addViewController("/hawtio/").setViewName("redirect:/hawtio/index.html");
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
