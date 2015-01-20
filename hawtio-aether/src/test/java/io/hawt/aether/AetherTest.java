package io.hawt.aether;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 */
public class AetherTest {
    private AetherFacade aether = new AetherFacade();

    @Before
    public void start() throws Exception {
        aether.init();
    }

    @After
    public void stop() throws Exception {
            aether.destroy();
        }

    @Test
    public void testResolve() throws Exception {
        AetherResult result = aether.resolve("org.apache.camel:camel-spring:2.10.4");
        String json = result.jsonString();
        System.out.println("Artifact: " + json);

        assertValidJSON(json);
    }

    @Test
    public void testResolveUrlToFileName() throws Exception {
        String result = aether.resolveUrlToFileName("io.fabric8.quickstarts/fabric8-quickstarts-parent/2.0.14/zip/app");
        System.out.println("result: " + result);
        assertNotNull(result);
        File file = new File(result);
        assertTrue("File should exist: "+ file.getAbsolutePath(), file.exists() && file.isFile());
    }

    public static JsonNode assertValidJSON(String json) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.reader().readTree(json);
    }


}
