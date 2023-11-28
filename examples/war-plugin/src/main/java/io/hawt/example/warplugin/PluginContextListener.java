package io.hawt.example.warplugin;

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
        plugin = new HawtioPlugin()
            // url is optional unless it is hosted on a different location
            //.url("http://localhost:8080")
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
