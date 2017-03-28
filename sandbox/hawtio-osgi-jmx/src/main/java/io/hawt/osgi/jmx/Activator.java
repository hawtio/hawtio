package io.hawt.osgi.jmx;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class Activator implements BundleActivator {

    private OSGiTools osgiTools;
    private ConfigAdmin configAdmin;
    private RBACDecorator rbacDecorator;

    @Override
    public void start(BundleContext context) throws Exception {
        osgiTools = new OSGiTools(context);
        osgiTools.init();

        configAdmin = new ConfigAdmin(context);
        configAdmin.init();

        rbacDecorator = new RBACDecorator(context);
        rbacDecorator.init();
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        rbacDecorator.destroy();
        configAdmin.destroy();
        osgiTools.destroy();
    }

}
