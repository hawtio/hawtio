package io.hawt.ide;

import static org.junit.Assert.assertNotNull;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;


public class IdeFacadeTest {
    IdeFacade facade = new IdeFacade();
    SourceReference sourceReference = new SourceReference();

    @Before
    public void init() throws Exception {
        facade.init();
        sourceReference.fileName="IdeFacade.java";
        sourceReference.className="io.hawt.ide.IdeFacade";
        sourceReference.line=17;
        sourceReference.column=5;
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
        assertFindSampleFileName();
        assertOperation("ideaOpenAndNavigate", facade.ideaOpen(sourceReference));
    }

    protected String assertFindSampleFileName() {
        String absoluteFile = SourceLocator.findClassAbsoluteFileName(sourceReference.fileName, sourceReference.className, facade.getBaseDir());
        assertNotNull("Should have found an absolute file", absoluteFile);
        return absoluteFile;
    }

    protected void assertOperation(String message, String result) {
        System.out.println("Invoked " + message + " with result " + result);
    }
}
