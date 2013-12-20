package io.hawt;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import io.hawt.jmx.About;
import io.hawt.jmx.JmxTreeWatcher;
import io.hawt.jmx.PluginRegistry;
import io.hawt.jmx.UploadManager;
import io.hawt.system.ConfigManager;

/**
 * A {@link javax.servlet.ServletContextListener} which initialises key hawtio services in the webapp
 */
public class HawtioContextListener implements ServletContextListener {

    private About about = new About();
    private JmxTreeWatcher treeWatcher = new JmxTreeWatcher();
    private PluginRegistry registry = new PluginRegistry();
    private UploadManager uploadManager = new UploadManager();
    private ConfigManager configManager = new ConfigManager();

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        try {
            about.init();
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
            about.destroy();
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
