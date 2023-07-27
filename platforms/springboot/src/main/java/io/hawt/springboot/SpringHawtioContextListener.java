package io.hawt.springboot;

import java.util.Objects;

import jakarta.servlet.ServletContextEvent;

import io.hawt.HawtioContextListener;
import io.hawt.system.ConfigManager;
import io.hawt.web.auth.SessionExpiryFilter;

public class SpringHawtioContextListener extends HawtioContextListener {

    public final String servletPath;

    public SpringHawtioContextListener(final ConfigManager configManager,
                                       final String servletPath) {
        super(configManager);
        this.servletPath = Objects.requireNonNull(servletPath);
    }

    @Override
    public void contextInitialized(final ServletContextEvent servletContextEvent) {
        super.contextInitialized(servletContextEvent);
        servletContextEvent.getServletContext()
            .setAttribute(SessionExpiryFilter.SERVLET_PATH, this.servletPath);
    }
}
