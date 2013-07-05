package io.hawt.dozer;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import javax.management.ObjectName;
import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

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
