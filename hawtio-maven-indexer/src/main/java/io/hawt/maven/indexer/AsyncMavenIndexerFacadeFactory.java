package io.hawt.maven.indexer;

import java.util.Arrays;
import java.util.Timer;
import java.util.TimerTask;
import javax.management.MBeanServer;
import javax.management.ObjectName;

import io.hawt.config.ConfigFacade;
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A factory bean of an {@link MavenIndexerFacade} which starts itself completely
 * asynchronously; since the indexer typically takes quite a while to startup.
 */
public class AsyncMavenIndexerFacadeFactory {
    private static final transient Logger LOG = LoggerFactory.getLogger(AsyncMavenIndexerFacadeFactory.class);

    private MavenIndexerFacade mavenIndexer;
    private boolean updateIndexOnStartup = true;
    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private String repositories;
    private String indexDirectory;
    private Timer timer;
    private TimerTask task;
    private ConfigFacade config;

    public void init() {
        config = ConfigFacade.getSingleton();

        if (config.isOffline()) {
            LOG.info("MavenIndexerFacade is not in use as hawtio is in offline mode");
            return;
        }

        timer = new Timer("MavenIndexerFacade startup timer", true);
        task = new TimerTask() {
            @Override
            public void run() {
                // need to set the tccl while running in osgi so plexus is able to find it's components.xml
                ClassLoader classLoader = Thread.currentThread().getContextClassLoader();                
                try {
                    Thread.currentThread().setContextClassLoader(getClass().getClassLoader());

                    LOG.debug("Starting to create the MavenIndexerFacade");
                    createMavenIndexer();
                    LOG.debug("Completed creating the MavenIndexerFacade");
                } catch (Exception e) {
                    LOG.error("Failed to create the MavenIndexerFacade: " + e, e);
                } finally {
                    Thread.currentThread().setContextClassLoader(classLoader);
                    // and no longer need for this thread as we are done
                    timer.cancel();
                }
            }
        };
        timer.schedule(task, 3000);
        LOG.info("Started the async timer to create the MavenIndexerFacade after the application starts up");
        if (repositories != null) {
            LOG.debug("Using remote repositories: " + Arrays.asList(repositories));
        }
    }

    public void destroy() throws Exception {
        if (mavenIndexer != null) {
            mavenIndexer.destroy();
        }
        if (task != null) {
            task.cancel();
        }
        if (timer != null) {
            timer.cancel();
        }
    }

    public String getIndexDirectory() {
        return indexDirectory;
    }

    public void setIndexDirectory(String indexDirectory) {
        this.indexDirectory = indexDirectory;
    }

    public MBeanServer getMBeanServer() {
        return mBeanServer;
    }

    public void setMBeanServer(MBeanServer mBeanServer) {
        this.mBeanServer = mBeanServer;
    }

    public ObjectName getObjectName() {
        return objectName;
    }

    public void setObjectName(ObjectName objectName) {
        this.objectName = objectName;
    }

    public String getRepositories() {
        return repositories;
    }

    public void setRepositories(String repositories) {
        this.repositories = repositories;
    }

    public boolean isUpdateIndexOnStartup() {
        return updateIndexOnStartup;
    }

    public void setUpdateIndexOnStartup(boolean updateIndexOnStartup) {
        this.updateIndexOnStartup = updateIndexOnStartup;
    }

    protected void createMavenIndexer() throws Exception {
        mavenIndexer = new MavenIndexerFacade();
        mavenIndexer.setUpdateIndexOnStartup(updateIndexOnStartup);
        if (Strings.isNotBlank(indexDirectory)) {
            mavenIndexer.setCacheDirName(indexDirectory);
        }
        if (objectName != null) {
            mavenIndexer.setObjectName(objectName);
        }
        if (mBeanServer != null) {
            mavenIndexer.setMBeanServer(mBeanServer);
        }
        if (repositories != null) {
            mavenIndexer.setRepositories(repositories);
        }
        mavenIndexer.init();
    }
}
