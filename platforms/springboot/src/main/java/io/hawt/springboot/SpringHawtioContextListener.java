package io.hawt.springboot;

import java.util.Map;
import java.util.Objects;

import io.hawt.springboot.security.SpringSecurityJAASConfiguration;
import io.hawt.web.auth.AuthenticationConfiguration;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;

import io.hawt.HawtioContextListener;
import io.hawt.system.ConfigManager;
import io.hawt.web.auth.SessionExpiryFilter;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

/**
 * <p>Extension of {@link HawtioContextListener} that performs Spring Framework/Boot specific initialization
 * of the web environment for Hawtio.</p>
 *
 * <p><strong>It's still critical to call base listener methods.</strong></p>
 */
public class SpringHawtioContextListener extends HawtioContextListener {

    public final String servletPath;

    /**
     * Called from Spring Bean (Java) configuration passing pre-configured {@link ConfigManager} and
     * a path under which the Hawtio servlets and filters are registered. This path can't be determined using
     * Jakarta Servlet API only (like {@code /actuator/hawtio} prefix).
     *
     * @param configManager
     * @param servletPath
     */
    public SpringHawtioContextListener(final ConfigManager configManager, final String servletPath) {
        super(configManager);
        this.servletPath = Objects.requireNonNull(servletPath);
    }

    @Override
    public void contextInitialized(final ServletContextEvent servletContextEvent) {
        super.contextInitialized(servletContextEvent);
        ServletContext context = servletContextEvent.getServletContext();
        context.setAttribute(SessionExpiryFilter.SERVLET_PATH, this.servletPath);
    }

    @Override
    protected void configureAuthenticationProviders(ServletContext servletContext, AuthenticationConfiguration authConfig) {
        // Configure Spring Security first.
        try {
            ApplicationContext context = WebApplicationContextUtils.getWebApplicationContext(servletContext);
            while (context != null) {
                Class<?> sfcClass
                        = Class.forName("org.springframework.security.web.SecurityFilterChain");
                Class<?> hawtioSpringSecurityLoginModule
                        = Class.forName("io.hawt.springboot.security.HawtioSpringSecurityLoginModule");
                Map<String, ?> filterChains = context.getBeansOfType(sfcClass);
                if (!filterChains.isEmpty()) {
                    // assume there's at least one SecurityFilterChain, usually configured with
                    // @EnableWebSecurity by @Bean method accepting
                    // org.springframework.security.config.annotation.web.builders.HttpSecurity builder.

                    // we have to configure JAAS login module that'll integrate with Spring Security
                    authConfig.setSpringSecurityEnabled(true);
                    authConfig.addConfiguration(new SpringSecurityJAASConfiguration(authConfig));
                    break;
                }
                context = context.getParent();
            }
        } catch (Exception ignored) {
            // Context was started with an exception. Ignore.
        }

        if (!authConfig.isSpringSecurityEnabled()) {
            // only now configure other providers (Keycloak, OIDC)
            super.configureAuthenticationProviders(servletContext, authConfig);
        }
    }

}
