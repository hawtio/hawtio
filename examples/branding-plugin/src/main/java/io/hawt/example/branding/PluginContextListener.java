package io.hawt.example.branding;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;

import io.hawt.web.plugin.HawtioPlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PluginContextListener implements ServletContextListener {

    private static final Logger LOG = LoggerFactory.getLogger(PluginContextListener.class);

    private HawtioPlugin plugin = null;

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        ServletContext context = servletContextEvent.getServletContext();

        plugin = new HawtioPlugin()
            .url(context.getInitParameter("plugin-url"))
            .scope(context.getInitParameter("plugin-name"))
            .module(context.getInitParameter("plugin-module"));
        plugin.init();

        LOG.info("Initialized {} plugin", plugin.getScope());
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        plugin.destroy();
        LOG.info("Destroyed {} plugin", plugin.getScope());
    }
}
