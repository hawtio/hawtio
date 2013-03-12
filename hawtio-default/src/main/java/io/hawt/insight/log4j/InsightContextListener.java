package io.hawt.insight.log4j;

import org.fusesource.insight.log.log4j.Log4jLogQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.io.File;

/**
 * A {@link ServletContextListener} which initialises the insight-log4j in the web app
 */
/*
    TODO remove this with a generic blueprint ServletContextListener which can then automatically
    boot up hawtio-git, insight-log4j and any other modules folks want to add without having to hack the web.xml
 */
public class InsightContextListener implements ServletContextListener {
    private static final transient Logger LOG = LoggerFactory.getLogger(InsightContextListener.class);
    private Log4jLogQuery helper = new Log4jLogQuery();

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        try {
            ServletContext context = servletContextEvent.getServletContext();
            String sizeText = context.getInitParameter("hawtio.log.size");
            if (sizeText != null) {
                helper.setSize(Integer.parseInt(sizeText));
            }
            helper.start();
            LOG.info("Started insight-log4j MBean");
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        try {
            LOG.info("Stopping insight-log4j MBean");
            helper.stop();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    protected RuntimeException createServletException(Exception e) {
        LOG.error(e.getMessage(), e);
        return new RuntimeException(e);
    }
}
