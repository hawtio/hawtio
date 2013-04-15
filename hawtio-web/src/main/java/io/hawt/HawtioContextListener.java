package io.hawt;

import io.hawt.jmx.JmxTreeWatcher;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * A {@link javax.servlet.ServletContextListener} which initialises key hawtio services in the webapp
 */
public class HawtioContextListener implements ServletContextListener {

    private JmxTreeWatcher treeWatcher = new JmxTreeWatcher();

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        try {
            treeWatcher.init();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        try {
            treeWatcher.destroy();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    protected RuntimeException createServletException(Exception e) {
        return new RuntimeException(e);
    }
}
