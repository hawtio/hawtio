package io.hawt.osgi;

import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;

import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.BundleReference;

public class OSGiToolsTest {
    @Test
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public void testOSGiTools() throws Exception {
        // Setup a mock OSGi classloader
        URL res = getClass().getClassLoader().getResource(getClass().getName().replace('.', '/') + ".class");
        File dir = new File(new File(res.getFile()).getParentFile(), "test");

        Bundle b1 = Mockito.mock(Bundle.class);
        Mockito.when(b1.getBundleId()).thenReturn(1L);
        TestClassLoader tcl = new TestClassLoader(b1, dir.toURI().toURL());
        Class barClass = tcl.loadClass("org.foo.Bar");
        Class stringClass = String.class;

        Bundle b2 = Mockito.mock(Bundle.class);
        Mockito.when(b2.getBundleId()).thenReturn(2L);
        Mockito.when(b2.loadClass("org.foo.Bar")).thenReturn(barClass);
        Mockito.when(b2.loadClass("org.foo.Bazzz")).thenThrow(ClassNotFoundException.class);
        Mockito.when(b2.loadClass("java.lang.String")).thenReturn(stringClass);

        BundleContext bc = Mockito.mock(BundleContext.class);
        Mockito.when(bc.getBundle(1)).thenReturn(b1);
        Mockito.when(bc.getBundle(2)).thenReturn(b2);

        OSGiTools tools = new OSGiTools(bc);

        Assert.assertEquals(1, tools.getLoadClassOrigin(2, "org.foo.Bar"));
        Assert.assertEquals(-1, tools.getLoadClassOrigin(2, "org.foo.Bazzz"));
        Assert.assertEquals(0, tools.getLoadClassOrigin(2, "java.lang.String"));

        try {
            tools.getLoadClassOrigin(5, "org.foo.Baz");
            Assert.fail("Should have thrown an IllegalArgumentException, bundle 5 doesn't exist");
        } catch (IllegalArgumentException iae) {
            // good
        }
    }

    private static class TestClassLoader extends URLClassLoader implements BundleReference {
        private final Bundle bundle;

        public TestClassLoader(Bundle b, URL ... urls) {
            super(urls);
            bundle = b;
        }

        @Override
        public Bundle getBundle() {
            return bundle;
        }
    }
}
