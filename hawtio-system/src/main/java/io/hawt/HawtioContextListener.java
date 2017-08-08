package io.hawt;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import io.hawt.jmx.About;
import io.hawt.jmx.JMXSecurity;
import io.hawt.jmx.JmxTreeWatcher;
import io.hawt.jmx.PluginRegistry;
import io.hawt.jmx.QuartzFacade;
import io.hawt.jmx.RBACRegistry;
import io.hawt.jmx.UploadManager;
import io.hawt.system.ConfigManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A {@link javax.servlet.ServletContextListener} which initialises key hawtio services in the webapp
 */
public class HawtioContextListener implements ServletContextListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(HawtioContextListener.class);

    private About about = new About();
    private QuartzFacade quartz = new QuartzFacade();
    private JmxTreeWatcher treeWatcher = new JmxTreeWatcher();
    private PluginRegistry registry = new PluginRegistry();
    private UploadManager uploadManager = new UploadManager();
    private ConfigManager configManager = new ConfigManager();
    private JMXSecurity jmxSecurity = new JMXSecurity();
    private RBACRegistry rbacRegistry = new RBACRegistry();

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        LOGGER.info("Initialising hawtio services");
        try {
            about.init();
            quartz.init();
            configManager.init();
            treeWatcher.init();
            registry.init();
            uploadManager.init(configManager);
            jmxSecurity.init();
            rbacRegistry.init();
        } catch (Exception e) {
            throw createServletException(e);
        }
        servletContextEvent.getServletContext().setAttribute("ConfigManager", configManager);
    }

    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        LOGGER.info("Destroying hawtio services");
        try {
            rbacRegistry.destroy();
            about.destroy();
            quartz.destroy();
            treeWatcher.destroy();
            registry.destroy();
            uploadManager.destroy();
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
