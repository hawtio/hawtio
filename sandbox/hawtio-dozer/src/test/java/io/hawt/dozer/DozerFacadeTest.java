package io.hawt.dozer;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;

/**
 * Tests basic operation of the dozer facade
 */
public class DozerFacadeTest {
    DozerFacade facade = createTestDozerFacade();

    public static File targetDir() {
        String basedir = System.getProperty("basedir", ".");
        return new File(basedir + "/target");
    }

    public static DozerFacade createTestDozerFacade() {
        DozerFacade answer = new DozerFacade();
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
    public void testDozer() throws Exception {
    }
}
