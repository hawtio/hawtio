package io.hawt.quarkus.deployment.test;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.List;
import java.util.Properties;

import io.quarkus.bootstrap.model.AppArtifact;
import io.quarkus.test.QuarkusUnitTest;
import io.restassured.RestAssured;
import org.jboss.shrinkwrap.api.ShrinkWrap;
import org.jboss.shrinkwrap.api.asset.Asset;
import org.jboss.shrinkwrap.api.asset.EmptyAsset;
import org.jboss.shrinkwrap.api.asset.StringAsset;
import org.jboss.shrinkwrap.api.spec.JavaArchive;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import static org.hamcrest.Matchers.containsString;

public class HawtioQuarkusAuthenticationDisabledTest {

    @RegisterExtension
    static final QuarkusUnitTest CONFIG = new QuarkusUnitTest()
        .setForcedDependencies(List.of(new AppArtifact("io.hawt", "hawtio-quarkus-deployment", "3.0-SNAPSHOT")))
        .setArchiveProducer(() -> ShrinkWrap.create(JavaArchive.class)
            .addAsManifestResource(EmptyAsset.INSTANCE, "beans.xml")
            .addAsResource(applicationProperties(), "application.properties"));

    @Test
    public void testHawtioIndexPage() {
        RestAssured.get("/hawtio")
            .then()
            .body(containsString("<title>Hawtio</title>"));
    }

    @Test
    public void testHawtioUserPublic() {
        RestAssured.get("/hawtio/user")
            .then()
            .statusCode(200)
            .body(containsString("\"public\""));
    }

    public static Asset applicationProperties() {
        Writer writer = new StringWriter();

        Properties props = new Properties();
        props.setProperty("quarkus.hawtio.authenticationEnabled", "false");

        try {
            props.store(writer, null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return new StringAsset(writer.toString());
    }
}
