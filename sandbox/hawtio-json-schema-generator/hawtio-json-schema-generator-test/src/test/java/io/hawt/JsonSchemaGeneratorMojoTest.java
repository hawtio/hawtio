package io.hawt;

import io.hawt.jsonschema.maven.plugin.JsonSchemaGeneratorMojo;
import org.apache.maven.plugin.testing.AbstractMojoTestCase;

import java.io.File;

/**
 * @author Stan Lewis
 */
public class JsonSchemaGeneratorMojoTest extends AbstractMojoTestCase {

    /*
    @Override
    protected void setUp() throws Exception {
        super.setUp();
    }
    */

    public void testMojoGoal()  throws Exception {
        File testPom = new File( getBasedir(), "/target/test-classes/test-pom.xml");
        JsonSchemaGeneratorMojo mojo = new JsonSchemaGeneratorMojo();
        configureMojo(mojo, "hawtio-json-schema-generator-plugin", testPom);
        mojo.execute();
    }

}
