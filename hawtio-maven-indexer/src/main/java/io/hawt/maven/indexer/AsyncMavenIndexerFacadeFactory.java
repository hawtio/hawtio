/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.maven.indexer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceNotFoundException;
import javax.management.MBeanRegistrationException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.io.File;
import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;

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
    private String[] repositories;

    private File cacheDirectory = new File("mavenIndexer");

    public void init() {
        Timer timer = new Timer("MavenIndexerFacade startup timer");
        TimerTask task = new TimerTask() {
            @Override
            public void run() {
                try {
                    LOG.info("Starting to create the MavenIndexerFacade");
                    createMavenIndexer();
                    LOG.info("Completed creating the MavenIndexerFacade");
                } catch (Exception e) {
                    LOG.error("Failed to create the MavenIndexerFacade: " + e, e);
                }
            }
        };
        timer.schedule(task, 3000);
        LOG.info("Started the async timer to create the MavenIndexerFacade after the application starts up");
    }

    public void destroy() throws InstanceNotFoundException, IOException, MBeanRegistrationException {
        if (mavenIndexer != null) {
            mavenIndexer.destroy();
        }
    }

    public File getCacheDirectory() {
        return cacheDirectory;
    }

    public void setCacheDirectory(File cacheDirectory) {
        this.cacheDirectory = cacheDirectory;
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

    public String[] getRepositories() {
        return repositories;
    }

    public void setRepositories(String[] repositories) {
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
        if (objectName != null) {
            mavenIndexer.setObjectName(objectName);
        }
        if (mBeanServer != null) {
            mavenIndexer.setMBeanServer(mBeanServer);
        }
        if (repositories != null) {
            mavenIndexer.setRepositories(repositories);
        }
        mavenIndexer.start();
    }
}
