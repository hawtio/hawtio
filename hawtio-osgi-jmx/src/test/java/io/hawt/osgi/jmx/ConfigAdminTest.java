package io.hawt.osgi.jmx;

import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

import org.junit.Test;
import org.mockito.Mockito;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;

public class ConfigAdminTest {

    @Test
    @SuppressWarnings("unchecked")
    public void testConfigAdminUpdate() throws Exception {
        Configuration conf = Mockito.mock(Configuration.class);

        ConfigurationAdmin cas = Mockito.mock(ConfigurationAdmin.class);
        Mockito.when(cas.getConfiguration("mypid", null)).thenReturn(conf);

        ServiceReference sr = Mockito.mock(ServiceReference.class);

        BundleContext bc = Mockito.mock(BundleContext.class);
        Mockito.when(bc.getServiceReference(ConfigurationAdmin.class.getName())).thenReturn(sr);
        Mockito.when(bc.getService(sr)).thenReturn(cas);

        ConfigAdmin ca = new ConfigAdmin(bc);

        Map<String, String> props = new HashMap<>();
        props.put("A", "B");
        props.put("C D", "E F");

        ca.configAdminUpdate("mypid", props);

        Mockito.verify(cas).getConfiguration("mypid", null);
        Mockito.verify(conf).update(new Hashtable<>(props));
    }

}
