package io.hawt.aether;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

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
        System.out.println("Artifact: " + result.jsonString());
    }


}
