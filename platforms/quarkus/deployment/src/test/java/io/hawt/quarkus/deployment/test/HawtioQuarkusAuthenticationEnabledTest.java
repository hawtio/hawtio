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

public class HawtioQuarkusAuthenticationEnabledTest {

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
    public void testHawtioUserForbidden() {
        RestAssured.get("/hawtio/user")
            .then()
            .statusCode(403);
    }

    @Test
    public void testHawtioLogin() {
        RestAssured.given()
            .body("{\"username\": \"hawtio\", \"password\": \"s3cr3t\"}")
            .post("/hawtio/auth/login")
            .then()
            .statusCode(200)
            .cookie("JSESSIONID");
    }

    @Test
    public void testHawtioLoginInvalidCredentials() {
        RestAssured.given()
            .body("{\"username\": \"foo\", \"password\": \"bar\"}")
            .post("/hawtio/auth/login")
            .then()
            .statusCode(403);
    }

    @Test
    public void testHawtioLoginInvalidRole() {
        RestAssured.given()
            .body("{\"username\": \"other\", \"password\": \"t0s3cr3t\"}")
            .post("/hawtio/auth/login")
            .then()
            .statusCode(403);
    }

    public static Asset applicationProperties() {
        Writer writer = new StringWriter();

        Properties props = new Properties();
        props.setProperty("quarkus.hawtio.authenticationEnabled", "true");
        props.setProperty("quarkus.hawtio.role", "admin");
        props.setProperty("quarkus.security.users.embedded.enabled", "true");
        props.setProperty("quarkus.security.users.embedded.plain-text", "true");
        props.setProperty("quarkus.security.users.embedded.users.hawtio", "s3cr3t");
        props.setProperty("quarkus.security.users.embedded.roles.hawtio", "admin");
        props.setProperty("quarkus.security.users.embedded.users.other", "t0s3cr3t");
        props.setProperty("quarkus.security.users.embedded.roles.other", "viewer");
        try {
            props.store(writer, null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return new StringAsset(writer.toString());
    }
}
