package io.hawt.osgi.jmx;

import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.util.Hashtable;
import java.util.Map;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;

public class ConfigAdmin implements ConfigAdminMXBean {
    private final BundleContext bundleContext;
    private ObjectName objectName;
    private MBeanServer mBeanServer;

    ConfigAdmin(BundleContext bc) {
        bundleContext = bc;
    }

    void init() throws Exception {
        if (objectName == null) {
            objectName = new ObjectName("hawtio:type=ConfigAdmin");
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
    public void configAdminUpdate(String pid, Map<String, String> data) {
        ServiceReference sref = bundleContext.getServiceReference(ConfigurationAdmin.class.getName());
        if (sref == null) {
            throw new IllegalStateException("The configuration admin service cannot be found.");
        }

        try {
            ConfigurationAdmin ca = (ConfigurationAdmin) bundleContext.getService(sref);
            if (ca == null) {
                throw new IllegalStateException("The configuration admin service cannot be found.");
            }
            Configuration config = ca.getConfiguration(pid, null);
            config.update(new Hashtable<String, String>(data));
        } catch (IOException ioe) {
            throw new RuntimeException(ioe);
        } finally {
            bundleContext.ungetService(sref);
        }
    }
}
