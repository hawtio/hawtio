package io.hawt.log.osgi;

import org.apache.karaf.log.core.LogService;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Activator implements BundleActivator {

    private transient Logger LOG = LoggerFactory.getLogger(Activator.class);

    private LogQuery logQuery;

    @Override
    public void start(BundleContext context) throws Exception {
        ServiceReference ref = context.getServiceReference(LogService.class.getName());
        if (ref != null) {
            LogService logService = (LogService) context.getService(ref);
            logQuery = new LogQuery(logService);
            logQuery.start();
        } else {
            LOG.warn("Cannot find OSGi service " + LogService.class.getName() + " to use by hawtio-log to trap into the Karaf logging service");
        }
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        if (logQuery != null) {
            logQuery.stop();
        }
    }
}

