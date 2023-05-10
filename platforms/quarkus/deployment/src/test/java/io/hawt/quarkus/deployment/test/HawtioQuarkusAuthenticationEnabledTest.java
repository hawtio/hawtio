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
import static org.hamcrest.Matchers.containsString;

public class HawtioQuarkusAuthenticationEnabledTest {

    @RegisterExtension
    static final QuarkusUnitTest CONFIG = new QuarkusUnitTest()
        .setForcedDependencies(Arrays.asList(new AppArtifact("io.hawt", "hawtio-quarkus-deployment", "2.11-SNAPSHOT")))
        .setArchiveProducer(() -> ShrinkWrap.create(JavaArchive.class)
            .addAsManifestResource(EmptyAsset.INSTANCE, "beans.xml")
            .addAsResource(applicationProperties(), "application.properties"));

    @Test
    public void testHawtioAccessDenied() throws Exception {
        RestAssured.get("/hawtio")
            .then()
            .body(containsString("<hawtio-login></hawtio-login>"));
    }

    @Test
    public void testHawtioLogin() throws Exception {
        RestAssured.given()
            .body("{\"username\": \"hawtio\", \"password\": \"s3cr3t\"}")
            .post("/hawtio/auth/login")
            .then()
            .statusCode(200)
            .cookie("JSESSIONID");
    }

    @Test
    public void testHawtioLoginInvalidCredentials() throws Exception {
        RestAssured.given()
            .body("{\"username\": \"foo\", \"password\": \"bar\"}")
            .post("/hawtio/auth/login")
            .then()
            .statusCode(403);
    }

    @Test
    public void testHawtioLoginInvalidRole() throws Exception {
        RestAssured.given()
            .body("{\"username\": \"other\", \"password\": \"t0s3cr3t\"}")
            .post("/hawtio/auth/login")
            .then()
            .statusCode(403);
    }

    public static final Asset applicationProperties() {
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
