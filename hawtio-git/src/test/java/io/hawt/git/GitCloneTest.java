package io.hawt.git;

import org.eclipse.jgit.api.Status;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import javax.management.ObjectName;
import java.io.File;
import java.io.IOException;
import java.util.List;

import static io.hawt.git.GitFacadeTest.assertConfigDirectoryExists;
import static io.hawt.git.GitFacadeTest.assertFileContents;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

/**
 * Tests we can clone a remote repo
 */
public class GitCloneTest {
    GitFacade git = new GitFacade();

    @Before
    public void init() throws Exception {
        git.init();
    }

    @After
    public void destroy() throws Exception {
        git.destroy();
    }

    @Test
    public void clonedRemoteRepo() throws Exception {
        assertConfigDirectoryExists(git);

        String contents = assertFileContents(git, "master", "/ReadMe.md");
        System.out.println("Read me is: " + contents.trim());
    }
}
