package io.hawt.example.warplugin;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

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
            .url("http://localhost:8080/hawtio-example-war-plugin")
            .scope("samplePlugin")
            .module("./plugin");
        plugin.init();

        LOG.info("Initialized {} plugin", plugin.getScope());
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        plugin.destroy();
        LOG.info("Destroyed {} plugin", plugin.getScope());
    }
}
