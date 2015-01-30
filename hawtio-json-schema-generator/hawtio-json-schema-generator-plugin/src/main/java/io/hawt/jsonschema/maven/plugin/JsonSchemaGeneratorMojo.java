package io.hawt.jsonschema.maven.plugin;

import io.hawt.jsonschema.SchemaLookup;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Map;

/**
 * Uses hawtio-json-schema-mbean to generate Json Schema for Java classes
 */
@Mojo( name="generate-json-schema", defaultPhase = LifecyclePhase.GENERATE_SOURCES )
public class JsonSchemaGeneratorMojo extends AbstractMojo {

    /**
     * Java classes to be converted into schema
     */
    @Parameter(required=true)
    private Map<String, String> classes;

    public void execute() throws MojoExecutionException
    {
        SchemaLookup lookup = new SchemaLookup();
        lookup.init();

        for (String clazz : this.classes.keySet()) {
            try {
                getLog().info("Looking up schema for class " + clazz);

                String targetFileName = this.classes.get(clazz);
                String fileContents = "var " + clazz.replace('.', '_') + " = " + lookup.getSchemaForClass(clazz) + ";\n\n";

                File outputFile = new File(targetFileName);

                if (outputFile.getParentFile().mkdirs()) {
                    getLog().info("Created path " + outputFile.getParentFile());
                }

                BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(outputFile));
                out.write(fileContents.getBytes());
                out.flush();
                out.close();
            } catch (Exception e) {
                throw new MojoExecutionException("Failed to generate schema for " + clazz, e);
            }
        }
    }
}
