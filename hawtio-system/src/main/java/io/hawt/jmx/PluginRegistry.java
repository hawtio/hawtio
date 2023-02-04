package io.hawt.jmx;

import java.util.concurrent.atomic.AtomicLong;

import javax.management.MBeanServerNotification;
import javax.management.MalformedObjectNameException;
import javax.management.Notification;
import javax.management.NotificationFilter;
import javax.management.NotificationListener;
import javax.management.ObjectName;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Hawtio plugin registry
 */
public class PluginRegistry extends JmxTreeWatcher implements PluginRegistryMBean {

    private static final Logger LOG = LoggerFactory.getLogger(PluginRegistry.class);

    private final AtomicLong updateCounter = new AtomicLong(0);
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
        return (notification, handback) -> {
            LOG.debug("Got notification: {} for object {}", notification, handback);
            updateCounter.incrementAndGet();
        };
    }

    protected NotificationFilter getNotificationFilter() {
        return new NotificationFilter() {
            private static final long serialVersionUID = 1L;

            @Override
            public boolean isNotificationEnabled(Notification notification) {
                if (notification instanceof MBeanServerNotification) {
                    MBeanServerNotification n = (MBeanServerNotification) notification;
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

