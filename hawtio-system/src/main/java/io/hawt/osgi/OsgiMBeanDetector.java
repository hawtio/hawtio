package io.hawt.osgi;

import org.jolokia.backend.executor.MBeanServerExecutor;
import org.jolokia.detector.ServerDetector;
import org.jolokia.detector.ServerHandle;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.osgi.util.tracker.ServiceTracker;

import javax.management.MBeanServer;
import javax.management.MBeanServerConnection;
import java.lang.instrument.Instrumentation;
import java.util.Set;

public class OsgiMBeanDetector implements ServerDetector {

    public OsgiMBeanDetector() {
    }

    @Override
    public ServerHandle detect(MBeanServerExecutor pMBeanServerExecutor) {
        return null;
    }

    @Override
    public void addMBeanServers(Set<MBeanServerConnection> pMBeanServers) {
        BundleContext context = null;
        try {
            Bundle bundle = FrameworkUtil.getBundle(getClass());
            context = bundle != null ? bundle.getBundleContext() : null;
        } catch (Throwable t) {
            // Ignore
        }
        if (context != null) {
            ServiceTracker<MBeanServer, MBeanServer> tracker = new ServiceTracker<>(context, MBeanServer.class, null);
            tracker.open();
            MBeanServer server = null;
            for (int i = 0; i < 1000; i++) {
                server = tracker.getService();
                if (server != null) {
                    break;
                }
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    return;
                }
            }
            if (server != null) {
                pMBeanServers.add(server);
            }
        }
    }

    @Override
    public void jvmAgentStartup(Instrumentation instrumentation) {
    }

}
