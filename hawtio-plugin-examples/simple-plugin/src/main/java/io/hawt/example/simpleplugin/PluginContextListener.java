package io.hawt.example.simpleplugin;

import io.hawt.web.plugin.HawtioPlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class PluginContextListener implements ServletContextListener {

  private static final Logger LOG = LoggerFactory.getLogger(PluginContextListener.class);

  HawtioPlugin plugin = null;

  @Override
  public void contextInitialized(ServletContextEvent servletContextEvent) {

    ServletContext context = servletContextEvent.getServletContext();

    plugin = new HawtioPlugin();
    plugin.setContext((String)context.getInitParameter("plugin-context"));
    plugin.setName(context.getInitParameter("plugin-name"));
    plugin.setScripts(context.getInitParameter("plugin-scripts"));
    plugin.setDomain(null);
    plugin.init();

    LOG.info("Initialized {} plugin", plugin.getName());
  }

  @Override
  public void contextDestroyed(ServletContextEvent servletContextEvent) {
    plugin.destroy();
    LOG.info("Destroyed {} plugin", plugin.getName());
  }
}
