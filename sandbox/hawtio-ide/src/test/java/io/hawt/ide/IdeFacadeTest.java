package io.hawt.ide;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.assertNotNull;


public class IdeFacadeTest {
    IdeFacade facade = new IdeFacade();

    @Before
    public void init() throws Exception {
        facade.init();
    }

    @After
    public void destroy() throws Exception {
        facade.destroy();
    }

    @Test
    public void testFindsFileInProject() throws Exception {
        String absoluteFile = assertFindSampleFileName();
        System.out.println("Found absolute file: " + absoluteFile);
    }

    //@Test
    @Ignore
    public void testOpenInIDEA() throws Exception {
        String fileName = assertFindSampleFileName();
        //assertOperation("ideaOpen", facade.ideaOpen(fileName));
        assertOperation("ideaOpenAndNavigate", facade.ideaOpenAndNavigate(fileName, 17, 5));
    }

    protected String assertFindSampleFileName() {
        String absoluteFile = facade.findClassAbsoluteFileName("IdeFacade.java", "io.hawt.ide.IdeFacade", null);
        assertNotNull("Should have found an absolute file", absoluteFile);
        return absoluteFile;
    }

    protected void assertOperation(String message, String result) {
        System.out.println("Invoked " + message + " with result " + result);
    }
}
