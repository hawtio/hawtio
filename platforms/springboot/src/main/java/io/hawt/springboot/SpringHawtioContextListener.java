package io.hawt.springboot;

import java.util.Objects;

import javax.servlet.ServletContextEvent;

import io.hawt.HawtioContextListener;
import io.hawt.system.ConfigManager;
import io.hawt.system.HawtioProperty;

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
                .setAttribute(HawtioProperty.SERVLET_PATH, this.servletPath);
    }
}
