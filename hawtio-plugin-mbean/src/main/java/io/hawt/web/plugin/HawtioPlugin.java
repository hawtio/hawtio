/*
 * Copyright 2012 Red Hat, Inc.
 *
 * Red Hat licenses this file to you under the Apache License, version
 * 2.0 (the "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied.  See the License for the specific language governing
 * permissions and limitations under the License.
 */

package io.hawt.web.plugin;

import java.lang.management.ManagementFactory;

import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Hawtio plugin
 */
public class HawtioPlugin implements HawtioPluginMBean {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioPlugin.class);

    private String url;
    private String scope;
    private String module;
    private String remoteEntryFileName;
    private Boolean bustRemoteEntryCache;
    private String pluginEntry;

    private ObjectName objectName = null;
    private MBeanServer mBeanServer = null;

    public HawtioPlugin() {
    }

    public void init() {
        try {
            if (objectName == null) {
                objectName = getObjectName();
            }

            if (mBeanServer == null) {
                mBeanServer = ManagementFactory.getPlatformMBeanServer();
            }

            if (mBeanServer.isRegistered(objectName)) {
                // Update of existing plugin
                LOG.info("Unregistering existing plugin: {}", objectName);
                mBeanServer.unregisterMBean(objectName);
            }

            LOG.debug("Registering plugin: {}", objectName);
            mBeanServer.registerMBean(this, objectName);

        } catch (Throwable t) {
            LOG.error("Failed to register plugin:", t);
        }
    }

    public void destroy() {
        try {
            if (mBeanServer != null) {
                LOG.debug("Unregistering plugin: {}", objectName);
                mBeanServer.unregisterMBean(objectName);
            }
        } catch (Throwable t) {
            LOG.error("Failed to register plugin:", t);
        }
    }

    public HawtioPlugin url(String url) {
        this.url = url;
        return this;
    }

    public HawtioPlugin scope(String scope) {
        this.scope = scope;
        return this;
    }

    public HawtioPlugin module(String module) {
        this.module = module;
        return this;
    }

    public HawtioPlugin remoteEntryFileName(String remoteEntryFileName) {
        this.remoteEntryFileName = remoteEntryFileName;
        return this;
    }

    public HawtioPlugin bustRemoteEntryCache(Boolean bustRemoteEntryCache) {
        this.bustRemoteEntryCache = bustRemoteEntryCache;
        return this;
    }

    public HawtioPlugin pluginEntry(String pluginEntry) {
        this.pluginEntry = pluginEntry;
        return this;
    }

    @Override
    public String getUrl() {
        return this.url;
    }

    @Override
    public String getScope() {
        return this.scope;
    }

    @Override
    public String getModule() {
        return this.module;
    }

    @Override
    public String getRemoteEntryFileName() {
        return this.remoteEntryFileName;
    }

    @Override
    public Boolean getBustRemoteEntryCache() {
        return this.bustRemoteEntryCache;
    }

    @Override
    public String getPluginEntry() {
        return this.pluginEntry;
    }

    protected ObjectName getObjectName() throws MalformedObjectNameException {
        return new ObjectName("hawtio:type=plugin,name=" + getScope());
    }
}
