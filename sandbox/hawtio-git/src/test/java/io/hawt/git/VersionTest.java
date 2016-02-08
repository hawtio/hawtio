package io.hawt.git;

import io.hawt.config.ConfigFacade;
import org.junit.Test;

/**
 */
public class VersionTest {
    @Test
    public void testVersion() throws Exception {
        String version = ConfigFacade.getSingleton().getVersion();
        System.out.println("Version is: " + version);
    }

}
