package io.hawt.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.lang.management.ManagementFactory;

/**
 * A helpful base class for MBeans
 */
public abstract class MBeanSupport {
    private static final transient Logger LOG = LoggerFactory.getLogger(MBeanSupport.class);

    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private boolean registered;

    public void init() throws Exception {
        // lets check if we have a config directory if not lets create one...
        // now lets expose the mbean...
        if (objectName == null) {
            objectName = new ObjectName(getDefaultObjectName());
        }
        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }
        if (!registered && !mBeanServer.isRegistered(objectName)) {
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch (InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                LOG.warn("This mbean is already registered " + objectName + ". There must be multiple deployment units with this mbean inside.");
/*
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
*/
            }
            registered = true;
        }
    }

    public void destroy() throws Exception {
        if (registered && objectName != null && mBeanServer != null) {
            registered = false;
            mBeanServer.unregisterMBean(objectName);
        }
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

    protected abstract String getDefaultObjectName();
}
