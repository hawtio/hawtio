package io.hawt.introspect;

import io.hawt.example.dozer.dto.CustomerDTO;
import io.hawt.introspect.dummy.Invoice;
import io.hawt.introspect.dummy.SomeBean;
import io.hawt.util.Objects;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class IntrospectTest {

    protected Introspector introspector = new Introspector();
    protected boolean verbose = Objects.equals(System.getProperty("verbose", "false"), "true");

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
            log("" + property);
        }

        Map<String, PropertyDTO> map = Introspections.getPropertyMap(properties);

        assertProperty(map.get("age"), "age", "int", true, true);
        assertProperty(map.get("name"), "name", "java.lang.String", true, true);
        assertProperty(map.get("readOnly"), "readOnly", "java.util.Date", true, false);
        assertProperty(map.get("writeOnly"), "writeOnly", "java.lang.Long", false, true);
    }

    @Test
    public void testIntrospectNestedProperties() throws Exception {
        String className = CustomerDTO.class.getName();

        assertFindProperties(className, "a", "address", "firstName", "lastName");
        assertFindProperties(className, "doesNotExist", "address", "firstName", "lastName");
        assertFindProperties(className, "address", "address", "address.streetName", "address.zipCode");
        assertFindProperties(className, "address.s", "address", "address.streetName", "address.zipCode");
        assertFindProperties(className, "address.", "address", "address.streetName", "address.zipCode");
        assertFindProperties(className, "address.doesNotExist", "address", "address.streetName", "address.zipCode");

        // test 2 levels of nesting...
        String invoiceClass = Invoice.class.getName();
        assertFindProperties(invoiceClass, "customer.address", "customer.address", "customer.address.streetName", "customer.address.zipCode");
        assertFindProperties(invoiceClass, "customer.address.", "customer.address", "customer.address.streetName", "customer.address.zipCode");
        assertFindProperties(invoiceClass, "customer.address.str", "customer.address", "customer.address.streetName", "customer.address.zipCode");
        assertFindProperties(invoiceClass, "customer.address.doesNotExist", "customer.address", "customer.address.streetName", "customer.address.zipCode");

    }


    @Test
    public void testFindTestCases() throws Exception {
        SortedSet<String> testClassNames = introspector.findJUnitTestClassNames();
        System.out.println("Test class names: " + testClassNames);
        assertTrue("Should have found a test class name", !testClassNames.isEmpty());
    }

    protected void assertFindProperties(String className, String filter, String... expectedNames) throws Exception {
        List<PropertyDTO> properties = introspector.findProperties(className, filter);
        log("Searched for " + filter + " for " + Arrays.asList(expectedNames));
        for (PropertyDTO property : properties) {
            log("  " + property.getName() + ": " + property.getTypeName());
        }
        int idx = 0;
        for (String expectedName : expectedNames) {
            assertTrue("Not enough properties returned. No result for " + expectedName, idx < properties.size());
            PropertyDTO propertyDTO = properties.get(idx);
            assertEquals("expected name for index " + idx + " " + propertyDTO, expectedName, propertyDTO.getName());
            idx++;
        }
    }

    @Test
    public void testFindClasses() throws Exception {
        assertFindClass("io.hawt.introspect.Introspector", "io", "io.", "Intro", "io.hawt.introspect.Introspector");
        assertFindClass("io.hawt.example.dozer.dto.CustomerDTO", "Cust", "Custom", "Customer");
    }

    @Test
    public void testFindLimitedClasses() throws Exception {
        SortedSet<String> classNames = introspector.findClassNames("io.", 1);
        assertEquals("Size of results " + classNames, 1, classNames.size());
    }

    protected void assertFindClass(String expectedClass, String... searchStrings) {
        for (String searchString : searchStrings) {
            Set<String> classNames = introspector.findClassNames(searchString, null);
            assertTrue("Results for searching for '" + searchString
                    + "' should contain '" + expectedClass + "' but was " + classNames,
                    classNames.contains(expectedClass));
        }
    }

    public void log(String message) {
        if (verbose) {
            System.out.println(message);
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
