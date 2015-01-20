package io.hawt.example.groovyshell;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import io.hawt.web.plugin.HawtioPlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PluginContextListener implements ServletContextListener {

    private static final Logger LOG = LoggerFactory.getLogger(PluginContextListener.class);

    HawtioPlugin plugin = null;
    GroovyShell shell = null;

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        ServletContext context = servletContextEvent.getServletContext();

        plugin = new HawtioPlugin();
        plugin.setContext((String) context.getInitParameter("plugin-context"));
        plugin.setName(context.getInitParameter("plugin-name"));
        plugin.setScripts(context.getInitParameter("plugin-scripts"));
        plugin.setDomain(null);
        plugin.init();

        shell = new GroovyShell();
        shell.init();

        LOG.info("Initialized {} plugin", plugin.getName());
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        shell.destroy();
        plugin.destroy();
        LOG.info("Destroyed {} plugin", plugin.getName());
    }

}
