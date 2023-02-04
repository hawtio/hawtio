package io.hawt.jmx;

import java.lang.management.ManagementFactory;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.MBeanServerDelegate;
import javax.management.Notification;
import javax.management.NotificationFilter;
import javax.management.NotificationListener;
import javax.management.ObjectName;

import io.hawt.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A simple MBean to watch the JMX tree, so it's easy for clients to know when they should refresh
 * their JMX trees (which typically isn't a cheap operation).
 */
public class JmxTreeWatcher implements JmxTreeWatcherMBean {
    private static final Logger LOG = LoggerFactory.getLogger(JmxTreeWatcher.class);
    private static final AtomicBoolean logged = new AtomicBoolean();

    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private final AtomicLong counter = new AtomicLong(0);
    private NotificationListener listener;
    private String version;

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
            } catch (InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
            }

            listener = getNotificationListener();
            NotificationFilter filter = getNotificationFilter();

            mBeanServer.addNotificationListener(MBeanServerDelegate.DELEGATE_NAME, listener, filter, null);
        }
        if (logged.compareAndSet(false, true)) {
            LOG.info("Welcome to Hawtio {}", getVersion());
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

    public String getVersion() {
        if (version == null) {
            try {
                version = Objects.getVersion(JmxTreeWatcher.class, "io.hawt", "hawtio-web");
            } catch (Exception e) {
                // ignore
            }
            if (version == null) {
                version = "";
            }
        }
        return version;
    }

    protected ObjectName getObjectName() throws Exception {
        return new ObjectName("hawtio:type=TreeWatcher");
    }

    protected NotificationListener getNotificationListener() {
        return (notification, handback) -> {
            // TODO should we filter only types "JMX.mbean.registered" and "JMX.mbean.unregistered"?
            counter.incrementAndGet();
        };
    }

    protected NotificationFilter getNotificationFilter() {
        return new NotificationFilter() {
            private static final long serialVersionUID = 1L;

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
