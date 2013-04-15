package io.hawt.git;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.io.File;

/**
 * A {@link ServletContextListener} which initialises the {@link GitFacade} in the web app
 */
public class GitContextListener  implements ServletContextListener {
    private GitFacade helper = new GitFacade();

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        try {
            ServletContext context = servletContextEvent.getServletContext();
            String configDir = context.getInitParameter("hawtio.config.dir");
            if (configDir != null) {
                helper.setConfigDirectory(new File(configDir));
            }
            String repo = context.getInitParameter("hawtio.config.repo");
            if (repo != null) {
                helper.setRemoteRepository(repo);
            }
            String cloneRemoteRepoOnStartup = context.getInitParameter("hawtio.config.cloneOnStartup");
            if (cloneRemoteRepoOnStartup != null && cloneRemoteRepoOnStartup.equals("false")) {
                helper.setCloneRemoteRepoOnStartup(false);
            }
            helper.init();

        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        try {
            helper.destroy();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    protected RuntimeException createServletException(Exception e) {
        return new RuntimeException(e);
    }
}
