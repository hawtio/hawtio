package io.hawt;

import java.util.Objects;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import io.hawt.jmx.About;
import io.hawt.jmx.JMXSecurity;
import io.hawt.jmx.JmxTreeWatcher;
import io.hawt.jmx.PluginRegistry;
import io.hawt.jmx.QuartzFacade;
import io.hawt.jmx.RBACRegistry;
import io.hawt.system.ConfigManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A {@link javax.servlet.ServletContextListener} which initialises key hawtio services in the webapp
 */
public class HawtioContextListener implements ServletContextListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(HawtioContextListener.class);

    private final About about;
    private final QuartzFacade quartz;
    private final JmxTreeWatcher treeWatcher;
    private final PluginRegistry registry;
    private final ConfigManager configManager;
    private final JMXSecurity jmxSecurity;
    private final RBACRegistry rbacRegistry;

    public HawtioContextListener() {
        this(new ConfigManager());
    }

    public HawtioContextListener(final ConfigManager configManager) {
        this.configManager = Objects.requireNonNull(configManager);

        this.about = new About();
        this.quartz = new QuartzFacade();
        this.treeWatcher = new JmxTreeWatcher();
        this.registry = new PluginRegistry();
        this.jmxSecurity = new JMXSecurity();
        this.rbacRegistry = new RBACRegistry();
    }

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        LOGGER.info("Initialising hawtio services");
        try {
            about.init();
            quartz.init();
            configManager.init(servletContextEvent.getServletContext());
            treeWatcher.init();
            registry.init();
            jmxSecurity.init();
            rbacRegistry.init();
        } catch (Exception e) {
            throw createServletException(e);
        }
        servletContextEvent.getServletContext().setAttribute(ConfigManager.CONFIG_MANAGER, configManager);
    }

    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        LOGGER.info("Destroying hawtio services");
        try {
            rbacRegistry.destroy();
            about.destroy();
            quartz.destroy();
            treeWatcher.destroy();
            registry.destroy();
            configManager.destroy();
            jmxSecurity.destroy();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    protected RuntimeException createServletException(Exception e) {
        return new RuntimeException(e);
    }
}
