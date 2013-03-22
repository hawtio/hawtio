package io.hawt.osgi.jmx;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class Activator implements BundleActivator {
    private OSGiTools osgiTools;

    @Override
    public void start(BundleContext context) throws Exception {
        osgiTools = new OSGiTools(context);
        osgiTools.init();
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        osgiTools.destroy();
    }
}
