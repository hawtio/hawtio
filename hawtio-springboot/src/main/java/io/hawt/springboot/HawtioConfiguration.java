package io.hawt.springboot;

import java.util.Arrays;
import java.util.Collections;

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
import io.hawt.web.UserServlet;
import io.hawt.web.XFrameOptionsFilter;
import io.hawt.web.keycloak.KeycloakServlet;
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

    @Bean
    public ServletRegistrationBean userServlet() {
        return new ServletRegistrationBean(new UserServlet(), "/user/*", "/hawtio/user/*");
    }

    @Bean
    public ServletRegistrationBean jolokiaproxy() {
        return new ServletRegistrationBean(new ProxyServlet(), "/hawtio/proxy/*");
    }

    @Bean
    public ServletRegistrationBean fileupload() {
        return new ServletRegistrationBean(new UploadServlet(), "/hawtio/file-upload/*");
    }

    @Bean
    public ServletRegistrationBean loginservlet() {
        return new ServletRegistrationBean(new LoginServlet(), "/hawtio/auth/login/*");
    }

    @Bean
    public ServletRegistrationBean logoutservlet() {
        return new ServletRegistrationBean(new LogoutServlet(), "/hawtio/auth/logout/*");
    }

    @Bean
    public ServletRegistrationBean keycloakservlet() {
        return new ServletRegistrationBean(new KeycloakServlet(), "/hawtio/keycloak/*");
    }

    @Bean
    public ServletRegistrationBean exportcontextservlet() {
        return new ServletRegistrationBean(new ExportContextServlet(), "/hawtio/exportContext/*");
    }

    @Bean
    public ServletRegistrationBean mavenSource() {
        return new ServletRegistrationBean(new JavaDocServlet(), "/hawtio/javadoc/*");
    }

    @Bean
    public ServletRegistrationBean contextFormatter() {
        return new ServletRegistrationBean(new ContextFormatterServlet(), "/hawtio/contextFormatter/*");
    }

    @Bean
    public ServletRegistrationBean gitServlet() {
        return new ServletRegistrationBean(new GitServlet(), "/hawtio/git/*");
    }

    @Bean
    public ServletListenerRegistrationBean hawtioContextListener() {
        return new ServletListenerRegistrationBean<>(new HawtioContextListener());
    }

    @Bean
    public ServletListenerRegistrationBean fileCleanerCleanup() {
        return new ServletListenerRegistrationBean<>(new FileCleanerCleanup());
    }

    @Bean
    public FilterRegistrationBean redirectFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new RedirectFilter());
        filter.setUrlPatterns(Collections.singletonList("/hawtio/*"));
        return filter;
    }

    @Bean
    public FilterRegistrationBean sessionExpiryFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new SessionExpiryFilter());
        filter.setUrlPatterns(Collections.singletonList("/hawtio/*"));
        return filter;
    }

    @Bean
    public FilterRegistrationBean cacheFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new CacheHeadersFilter());
        filter.setUrlPatterns(Collections.singletonList("/hawtio/*"));
        return filter;
    }

    @Bean
    public FilterRegistrationBean CORSFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new CORSFilter());
        filter.setUrlPatterns(Collections.singletonList("/hawtio/*"));
        return filter;
    }

    @Bean
    public FilterRegistrationBean XFrameOptionsFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new XFrameOptionsFilter());
        filter.setUrlPatterns(Collections.singletonList("/hawtio/*"));
        return filter;
    }

    @Bean
    public FilterRegistrationBean AuthenticationFilter() {
        final FilterRegistrationBean filter = new FilterRegistrationBean();
        filter.setFilter(new AuthenticationFilter());
        filter.setUrlPatterns(Arrays.asList("/hawtio/auth/*", "/jolokia/*", "/hawtio/upload/*", "/hawtio/javadoc/*"));
        return filter;
    }

}
