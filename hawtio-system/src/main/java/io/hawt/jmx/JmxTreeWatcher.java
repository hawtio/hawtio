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
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A simple mbean to watch the JMX tree so its easy for clients to know when they should refresh their JMX trees (which typically isn't a cheap operation).
 */
public class JmxTreeWatcher implements JmxTreeWatcherMBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(JmxTreeWatcher.class);
    private static AtomicBoolean logged = new AtomicBoolean();

    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private AtomicLong counter = new AtomicLong(0);
    private NotificationListener listener;
    private NotificationFilter filter;
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

            Object handback = null;

            listener = getNotificationListener();
            filter = getNotificationFilter();

            mBeanServer.addNotificationListener(MBeanServerDelegate.DELEGATE_NAME, listener, filter, handback);
        }
        if (logged.compareAndSet(false, true)) {
            String text = getVersion();
            if (Strings.isNotBlank(text)) {
                text += " ";
            }
            LOG.info("Welcome to hawtio " + text + ": http://hawt.io/ : Don't cha wish your console was hawt like me? ;-)");
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
