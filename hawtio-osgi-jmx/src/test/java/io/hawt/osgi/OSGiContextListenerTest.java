package io.hawt.osgi;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;

import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;
import org.osgi.framework.BundleContext;

public class OSGiContextListenerTest {
    @Test
    public void testOSGiContextListener() throws Exception {
        final OSGiTools mockTools = Mockito.mock(OSGiTools.class);

        final boolean[] toolsCreated = new boolean[] { false };
        OSGiContextListener ocl = new OSGiContextListener() {
            @Override
            OSGiTools createOSGiTools(BundleContext bundleContext) {
                toolsCreated[0] = true;
                return mockTools;
            }
        };

        BundleContext bc = Mockito.mock(BundleContext.class);

        ServletContext sc = Mockito.mock(ServletContext.class);
        Mockito.when(sc.getAttribute("osgi-bundlecontext")).thenReturn(bc);

        ServletContextEvent event = Mockito.mock(ServletContextEvent.class);
        Mockito.when(event.getServletContext()).thenReturn(sc);

        Assert.assertNull("Precondition", ocl.osgiTools);
        ocl.contextInitialized(event);
        Assert.assertTrue(toolsCreated[0]);
        Mockito.verify(mockTools).init();
        Mockito.verifyNoMoreInteractions(mockTools);

        ocl.contextDestroyed(null);
        Mockito.verify(mockTools).destroy();
        Mockito.verifyNoMoreInteractions(mockTools);
    }

    @Test
    public void testOSGiContextListenerOutsideOfOSGi() {
        final boolean[] toolsCreated = new boolean[] { false };
        OSGiContextListener ocl = new OSGiContextListener() {
            @Override
            OSGiTools createOSGiTools(BundleContext bundleContext) {
                toolsCreated[0] = true;
                return null;
            }
        };

        ServletContextEvent event = Mockito.mock(ServletContextEvent.class);
        Mockito.when(event.getServletContext()).thenReturn(Mockito.mock(ServletContext.class));

        Assert.assertNull("Precondition", ocl.osgiTools);
        ocl.contextInitialized(event);
        Assert.assertFalse(toolsCreated[0]);
        Assert.assertNull("Not running in OSGi, should not initialize", ocl.osgiTools);

        ocl.contextDestroyed(null);
    }
}
