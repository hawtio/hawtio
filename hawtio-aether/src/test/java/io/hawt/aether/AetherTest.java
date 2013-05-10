package io.hawt.aether;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

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

    public static JsonNode assertValidJSON(String json) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.reader().readTree(json);
    }


}
