package io.hawt.osgi.jmx;

import java.lang.management.ManagementFactory;
import java.net.URL;

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

    void init() throws Exception {
        if (objectName == null) {
            objectName = new ObjectName("hawtio:type=OSGiTools");
        }
        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }
        mBeanServer.registerMBean(this, objectName);
    }

    void destroy() throws Exception {
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

    @Override
    public String getResourceURL(long bundleID, String resource) {
        Bundle b = bundleContext.getBundle(bundleID);
        if (b == null)
            throw new IllegalArgumentException("Not a valid bundle ID: " + bundleID);

        URL res = b.getResource(resource);
        if (res == null)
            return null;
        else
            return res.toString();
    }
}
