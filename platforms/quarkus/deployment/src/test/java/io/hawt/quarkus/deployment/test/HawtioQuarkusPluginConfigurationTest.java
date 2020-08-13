package io.hawt.quarkus.deployment.test;

import io.quarkus.bootstrap.model.AppArtifact;
import io.quarkus.test.QuarkusUnitTest;
import io.restassured.RestAssured;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Arrays;
import java.util.Properties;

import org.jboss.shrinkwrap.api.ShrinkWrap;
import org.jboss.shrinkwrap.api.asset.Asset;
import org.jboss.shrinkwrap.api.asset.EmptyAsset;
import org.jboss.shrinkwrap.api.asset.StringAsset;
import org.jboss.shrinkwrap.api.spec.JavaArchive;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import static org.hamcrest.CoreMatchers.is;

public class HawtioQuarkusPluginConfigurationTest {

    @RegisterExtension
    static final QuarkusUnitTest CONFIG = new QuarkusUnitTest()
        .setForcedDependencies(Arrays.asList(new AppArtifact("io.hawt", "hawtio-quarkus-deployment", "2.11-SNAPSHOT")))
        .setArchiveProducer(() -> ShrinkWrap.create(JavaArchive.class)
            .addAsManifestResource(EmptyAsset.INSTANCE, "beans.xml")
            .addAsResource(applicationProperties(), "application.properties"));

    @Test
    public void testHawtioPluginEndpoint() throws Exception {
        RestAssured.get("/hawtio/plugin")
            .then()
            .body(is("[{\"Name\":\"sample-plugin-config\",\"Context\":\"\",\"Domain\":\"\",\"Scripts\":[\"sample-plugin/sample-plugin.js\"]}]"));
    }

    public static final Asset applicationProperties() {
        Writer writer = new StringWriter();

        Properties props = new Properties();
        props.setProperty("quarkus.hawtio.authenticationEnabled", "false");
        props.setProperty("quarkus.hawtio.sample-plugin-config.script-paths", "sample-plugin/sample-plugin.js");

        try {
            props.store(writer, null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return new StringAsset(writer.toString());
    }
}
