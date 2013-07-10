package io.hawt.introspect;

import io.hawt.introspect.dummy.SomeBean;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;


public class IntrospectTest {
    Introspector facade = new Introspector();

    @Before
    public void init() throws Exception {
        facade.init();
    }

    @After
    public void destroy() throws Exception {
        facade.destroy();
    }

    @Test
    public void testIntrospects() throws Exception {
        List<PropertyDTO> properties = facade.getProperties(SomeBean.class.getName());
        assertNotNull("Should have returned a list of properties", properties);
        assertEquals("number of properties " + properties, 4, properties.size());

        for (PropertyDTO property : properties) {
            System.out.println("" + property);
        }

        Map<String, PropertyDTO> map = Introspections.getPropertyMap(properties);

        assertProperty(map.get("age"), "age", "int", true, true);
        assertProperty(map.get("name"), "name", "java.lang.String", true, true);
        assertProperty(map.get("readOnly"), "readOnly", "java.util.Date", true, false);
        assertProperty(map.get("writeOnly"), "writeOnly", "java.lang.Long", false, true);
    }

    public static void assertProperty(PropertyDTO property, String expectedName, String expectedTypeName, boolean expectedReadable, boolean expectedWriteable) {
        assertNotNull("property should not be null!", property);
        assertEquals("property name", expectedName, property.getName());
        assertEquals("property type", expectedTypeName, property.getTypeName());
        assertEquals("property readable", expectedReadable, property.isReadable());
        assertEquals("property writeable", expectedWriteable, property.isWriteable());
    }

}
