package io.hawt.introspect;

import io.hawt.introspect.dummy.SomeBean;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class IntrospectTest {
    protected Introspector introspector = new Introspector();

    @Before
    public void init() throws Exception {
        introspector.init();
    }

    @After
    public void destroy() throws Exception {
        introspector.destroy();
    }

    @Test
    public void testIntrospects() throws Exception {
        List<PropertyDTO> properties = introspector.getProperties(SomeBean.class.getName());
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

    @Test
    public void testFindClasses() throws Exception {
        assertFindClass("io.hawt.introspect.Introspector", "io.hawt.introspect.Introspector", "io", "io.", "Intro");
    }

    protected void assertFindClass(String expectedClass, String... searchStrings) {
        for (String searchString : searchStrings) {
            Set<String> classNames = introspector.findClassNames(searchString);
            assertTrue("Results for searching for '" + searchString
                    + "' should contain '" + expectedClass + "' but was " + classNames,
                    classNames.contains(expectedClass));
        }
    }


    public static void assertProperty(PropertyDTO property, String expectedName, String expectedTypeName, boolean expectedReadable, boolean expectedWriteable) {
        assertNotNull("property should not be null!", property);
        assertEquals("property name", expectedName, property.getName());
        assertEquals("property type", expectedTypeName, property.getTypeName());
        assertEquals("property readable", expectedReadable, property.isReadable());
        assertEquals("property writeable", expectedWriteable, property.isWriteable());
    }

}
