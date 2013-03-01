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
package io.hawt.jmx;

import javax.management.MBeanServer;
import javax.management.MBeanServerDelegate;
import javax.management.Notification;
import javax.management.NotificationFilter;
import javax.management.NotificationListener;
import javax.management.ObjectName;
import java.lang.management.ManagementFactory;
import java.util.concurrent.atomic.AtomicLong;

/**
 * A simple mbean to watch the JMX tree so its easy for clients to know when they should refresh their JMX trees (which typically isn't a cheap operation).
 */
public class JmxTreeWatcher implements JmxTreeWatcherMBean {
    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private AtomicLong counter = new AtomicLong(0);
    private NotificationListener listener;

    public void init() throws Exception {
        if (objectName == null) {
            objectName = new ObjectName("io.hawt.jmx:type=TreeWatcher");
        }
        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }
        if (mBeanServer != null) {
            mBeanServer.registerMBean(this, objectName);

            Object handback = null;
            listener = new NotificationListener() {
                @Override
                public void handleNotification(Notification notification, Object handback) {
                    // TODO should we filter only types "JMX.mbean.registered" and "JMX.mbean.unregistered"?
                    counter.incrementAndGet();
                }
            };
            NotificationFilter filter = new NotificationFilter() {
                @Override
                public boolean isNotificationEnabled(Notification notification) {
                    return true;
                }
            };
            mBeanServer.addNotificationListener(MBeanServerDelegate.DELEGATE_NAME, listener, filter, handback);
        }
    }

    public void destroy() throws Exception {
        if (mBeanServer != null) {
            if (listener != null) {
                mBeanServer.removeNotificationListener(MBeanServerDelegate.DELEGATE_NAME, listener);
            }
            if (objectName != null) {
                mBeanServer.unregisterMBean(objectName);
            }
        }
    }

    @Override
    public long getCounter() {
        return counter.get();
    }
}
