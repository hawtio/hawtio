package io.hawt.jsonschema;

import org.junit.Assert;
import org.junit.Test;

/**
 * @author Stan Lewis
 */
public class SchemaLookupTest {

    @Test
    public void testLookupSchema() throws Exception {
        SchemaLookup lookup = createSchemaLookup();
        String result = lookup.getSchemaForClass("java.lang.String");
    }

    @Test
    public void testLookupMoreInterestingSchema() throws Exception {
        SchemaLookup lookup = createSchemaLookup();
        String result = lookup.getSchemaForClass("org.fusesource.fabric.api.CreateSshContainerOptions");
        System.out.println("Got: \n\n" + result + "\n\n");
    }

    @Test
    public void testFailedLookup() throws Exception {
        SchemaLookup lookup = createSchemaLookup();
        try {
            String result = lookup.getSchemaForClass("James");
            Assert.fail("Should have thrown a NoClassDefFoundException");
        } catch (Exception e) {
            // pass
        }
    }

    protected SchemaLookup createSchemaLookup() {
        SchemaLookup lookup = new SchemaLookup();
        lookup.init();
        return lookup;
    }

}
