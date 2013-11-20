package io.hawt;

import io.hawt.jmx.JmxTreeWatcher;
import io.hawt.jmx.PluginRegistry;
import io.hawt.jmx.UploadManager;
import io.hawt.system.ConfigManager;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * A {@link javax.servlet.ServletContextListener} which initialises key hawtio services in the webapp
 */
public class HawtioContextListener implements ServletContextListener {

    private JmxTreeWatcher treeWatcher = new JmxTreeWatcher();
    private PluginRegistry registry = new PluginRegistry();
    private UploadManager uploadManager = new UploadManager();
    private ConfigManager configManager = new ConfigManager();

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        try {
            configManager.init();
            treeWatcher.init();
            registry.init();
            uploadManager.init(configManager);
        } catch (Exception e) {
            throw createServletException(e);
        }
        servletContextEvent.getServletContext().setAttribute("ConfigManager", configManager);
    }

    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        try {
            treeWatcher.destroy();
            registry.destroy();
            uploadManager.destroy();
            configManager.destroy();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    protected RuntimeException createServletException(Exception e) {
        return new RuntimeException(e);
    }
}
