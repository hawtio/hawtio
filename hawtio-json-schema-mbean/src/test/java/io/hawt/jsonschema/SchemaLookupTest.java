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

    // right now these just verify the lookup doesn't bail
    @Test
    public void testObjectWithJaxbAnnotations() throws Exception {
        SchemaLookup lookup = createSchemaLookup();
        String result = lookup.getSchemaForClass("io.hawt.jsonschema.ObjectWithJaxbAnnotations");
        System.out.println("Got: \n\n" + result + "\n\n");
    }

    @Test
    public void testObjectWithValidationAnnotations() throws Exception {
        SchemaLookup lookup = createSchemaLookup();
        String result = lookup.getSchemaForClass("io.hawt.jsonschema.ObjectWithValidationAnnotations");
        System.out.println("Got: \n\n" + result + "\n\n");
    }

    @Test
    public void testObjectWithJsonAnnotations() throws Exception {
        SchemaLookup lookup = createSchemaLookup();
        String result = lookup.getSchemaForClass("io.hawt.jsonschema.ObjectWithJsonAnnotations");
        System.out.println("Got: \n\n" + result + "\n\n");
    }

}
