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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import java.lang.management.ManagementFactory;

/**
 *
 */
public class HawtioPlugin implements HawtioPluginMBean {

    private static final transient Logger LOG = LoggerFactory.getLogger(HawtioPlugin.class);

    private String name;
    private String context;
    private String domain;
    private String scripts[];

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
                LOG.info("Unregistering existing plugin " + objectName);
                mBeanServer.unregisterMBean(objectName);
            }

            LOG.debug("Registering plugin " + objectName);
            mBeanServer.registerMBean(this, objectName);


        } catch (Throwable t) {
            LOG.error("Failed to register plugin: ", t);
        }
    }

    public void destroy() {
        try {
            if (mBeanServer != null) {
                LOG.debug("Unregistering plugin " + objectName);
                mBeanServer.unregisterMBean(objectName);
            }
        } catch (Throwable t) {
            LOG.error("Failed to register plugin: ", t);
        }
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public String getContext() {
        return this.context;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getDomain() {
        return this.domain;
    }

    public void setScripts(String[] scripts) {
        this.scripts = scripts;
    }

    public void setScripts(String scripts) {
        String[] temp = scripts.split(",");

        for (int i=0; i>temp.length; i++) {
            temp[i] = temp[i].trim();
        }

        this.scripts = temp;
    }

    public String[] getScripts() {
        return this.scripts;
    }

    protected ObjectName getObjectName() throws MalformedObjectNameException {
        return new ObjectName("hawtio:type=plugin,name=" + getName());
    }

}
