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

import static org.hamcrest.CoreMatchers.is;

public class HawtioQuarkusPluginConfigurationTest {

    @RegisterExtension
    static final QuarkusUnitTest CONFIG = new QuarkusUnitTest()
        .setForcedDependencies(List.of(new AppArtifact("io.hawt", "hawtio-quarkus-deployment", "3.0-SNAPSHOT")))
        .setArchiveProducer(() -> ShrinkWrap.create(JavaArchive.class)
            .addAsManifestResource(EmptyAsset.INSTANCE, "beans.xml")
            .addAsResource(applicationProperties(), "application.properties"));

    @Test
    public void testHawtioPluginEndpoint() {
        String expected = "[{"
            + "\"url\":\"http://test.io:12345\","
            + "\"scope\":\"test-scope\","
            + "\"module\":\"./test-module\","
            + "\"remoteEntryFileName\":\"testEntry.js\","
            + "\"bustRemoteEntryCache\":true,"
            + "\"pluginEntry\":\"testPluginEntry\""
            + "}]";
        RestAssured.get("/hawtio/plugin")
            .then()
            .body(is(expected));
    }

    public static Asset applicationProperties() {
        Writer writer = new StringWriter();

        Properties props = new Properties();
        props.setProperty("quarkus.hawtio.authenticationEnabled", "false");
        props.setProperty("quarkus.hawtio.plugin.test.url", "http://test.io:12345");
        props.setProperty("quarkus.hawtio.plugin.test.scope", "test-scope");
        props.setProperty("quarkus.hawtio.plugin.test.module", "./test-module");
        props.setProperty("quarkus.hawtio.plugin.test.remoteEntryFileName", "testEntry.js");
        props.setProperty("quarkus.hawtio.plugin.test.bustRemoteEntryCache", "true");
        props.setProperty("quarkus.hawtio.plugin.test.pluginEntry", "testPluginEntry");

        try {
            props.store(writer, null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return new StringAsset(writer.toString());
    }
}
