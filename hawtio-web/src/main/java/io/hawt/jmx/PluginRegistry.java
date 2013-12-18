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

package io.hawt.jmx;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 *
 */
public class PluginRegistry extends JmxTreeWatcher implements PluginRegistryMBean {

    private static final transient Logger LOG = LoggerFactory.getLogger(PluginRegistry.class);

    private AtomicLong updateCounter = new AtomicLong(0);
    private ObjectName comparator = null;

    public PluginRegistry() {

    }

    @Override
    public void init() {
        try {
            comparator = new ObjectName("hawtio:type=plugin,name=*");
            super.init();
        } catch (MalformedObjectNameException mone) {
            LOG.error("Failed to initialize comparator object name", mone);
        } catch (Exception e) {
            LOG.error("Failed to initialize plugin registry: ", e);
        }
    }

    @Override
    protected ObjectName getObjectName() throws Exception {
        return new ObjectName("hawtio:type=Registry");
    }

    protected NotificationListener getNotificationListener() {
        return new NotificationListener() {
            @Override
            public void handleNotification(Notification notification, Object handback) {

                LOG.debug("Got notification: " + notification + " for object " + handback);

                updateCounter.incrementAndGet();
            }
        };
    }

    protected NotificationFilter getNotificationFilter() {
        return new NotificationFilter() {
            private static final long serialVersionUID = 1L;
            @Override
            public boolean isNotificationEnabled(Notification notification) {
                if (notification instanceof MBeanServerNotification) {
                    MBeanServerNotification n = (MBeanServerNotification)notification;
                    return comparator.apply(n.getMBeanName());
                }
                return false;
            }
        };
    }

    @Override
    public long getUpdateCounter() {
        return updateCounter.get();
    }


}

