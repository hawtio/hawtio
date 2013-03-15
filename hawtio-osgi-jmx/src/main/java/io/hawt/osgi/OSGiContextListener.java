package io.hawt.osgi;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.osgi.framework.BundleContext;

public class OSGiContextListener implements ServletContextListener {
    OSGiTools osgiTools;

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        try {
            Object bcAttr = servletContextEvent.getServletContext().getAttribute("osgi-bundlecontext");
            if (bcAttr == null) {
                // not run in an OSGi environment.
                return;
            }

            if (bcAttr instanceof BundleContext == false)
                return;

            BundleContext bundleContext = (BundleContext) bcAttr;
            osgiTools = createOSGiTools(bundleContext);
            osgiTools.init();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        try {
            if (osgiTools != null)
                osgiTools.destroy();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    OSGiTools createOSGiTools(BundleContext bundleContext) {
        return new OSGiTools(bundleContext);
    }
}
