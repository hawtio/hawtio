package io.hawt.config;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;


public class ConfigFacadeTest {
    ConfigFacade facade = new ConfigFacade();

    @Before
    public void init() throws Exception {
        facade.init();
    }

    @After
    public void destroy() throws Exception {
        facade.destroy();
    }

    @Test
    public void testDefaultsToHomeDirectory() throws Exception {
        File configDirectory = facade.getConfigDirectory();
        assertTrue("the config directory should exist " + configDirectory, configDirectory.exists());
        assertTrue("the config directory should be a directory " + configDirectory, configDirectory.isDirectory());
        assertEquals("The config directory name", ".hawtio", configDirectory.getName());

        File homeDir = new File(System.getProperty("user.home", "noHomeDir"));
        File parentFile = configDirectory.getParentFile();
        assertNotNull("Should have a parent directory", parentFile);

        assertEquals("config dir should be in the home directory", homeDir.getCanonicalPath(), parentFile.getCanonicalPath());
    }

    @Test
    public void testHasVersion() throws Exception {
        String version = facade.getVersion();
        System.out.println("Has version: " + version);
    }

}
