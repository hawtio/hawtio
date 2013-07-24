package io.hawt.spring;

import io.hawt.config.ConfigFacade;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;

/**
 * Tests basic operation of the dozer facade
 */
public class SpringConfigTest {
    SpringConfigFacade facade = createTestSpringConfigFacade();

    public static SpringConfigFacade createTestSpringConfigFacade() {
        SpringConfigFacade answer = new SpringConfigFacade();
        return answer;
    }

    @Before
    public void init() throws Exception {
        facade.init();
    }

    @After
    public void destroy() throws Exception {
        facade.destroy();
    }

    @Test
    public void testSpringConfig() throws Exception {
        File configDirectory = facade.getSpringConfigDirectory();

        File newSpringXml = new File(configDirectory, "spring/myconfig.xml");

        // TODO now we should create a new Spring XML file for newSpringXml

        // TODO now lets wait a bit...

        // TODO now lets test that the new spring application context has been created - using some
        // static field configured via a bean in the spring.xml?
    }
}
