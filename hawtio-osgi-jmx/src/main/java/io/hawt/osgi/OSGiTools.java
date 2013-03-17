package io.hawt.osgi;

import java.lang.management.ManagementFactory;

import javax.management.MBeanServer;
import javax.management.ObjectName;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.BundleReference;

public class OSGiTools implements OSGiToolsMXBean {
    private final BundleContext bundleContext;
    private ObjectName objectName;
    private MBeanServer mBeanServer;

    OSGiTools(BundleContext bc) {
        bundleContext = bc;
    }

    public void init() throws Exception {
        if (objectName == null) {
            objectName = new ObjectName("io.hawt.osgi:type=OSGiTools");
        }
        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }
        mBeanServer.registerMBean(this, objectName);
    }

    public void destroy() throws Exception {
        if (objectName != null && mBeanServer != null) {
            mBeanServer.unregisterMBean(objectName);
        }
    }

    @Override
    public long getLoadClassOrigin(long bundleID, String clazz) {
        Bundle b = bundleContext.getBundle(bundleID);
        if (b == null)
            throw new IllegalArgumentException("Not a valid bundle ID: " + bundleID);

        try {
            Class<?> cls = b.loadClass(clazz);
            ClassLoader classLoader = cls.getClassLoader();
            if (classLoader instanceof BundleReference)
                return ((BundleReference) classLoader).getBundle().getBundleId();
            else
                return 0;
        } catch (ClassNotFoundException e) {
        }

        return -1;
    }
}
