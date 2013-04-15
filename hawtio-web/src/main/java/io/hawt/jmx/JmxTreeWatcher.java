package io.hawt.jmx;

import javax.management.*;
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
    private NotificationFilter filter;

    public void init() throws Exception {
        if (objectName == null) {
            objectName = getObjectName();
        }

        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }

        if (mBeanServer != null) {
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch(InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
            }

            Object handback = null;

            listener = getNotificationListener();
            filter =  getNotificationFilter();

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

    protected ObjectName getObjectName() throws Exception {
        return new ObjectName("io.hawt.jmx:type=TreeWatcher");
    }

    protected NotificationListener getNotificationListener() {
        return new NotificationListener() {
            @Override
            public void handleNotification(Notification notification, Object handback) {
                // TODO should we filter only types "JMX.mbean.registered" and "JMX.mbean.unregistered"?
                counter.incrementAndGet();
            }
        };
    }

    protected NotificationFilter getNotificationFilter() {
        return new NotificationFilter() {
            @Override
            public boolean isNotificationEnabled(Notification notification) {
                return true;
            }
        };
    }

    @Override
    public long getCounter() {
        return counter.get();
    }
}
