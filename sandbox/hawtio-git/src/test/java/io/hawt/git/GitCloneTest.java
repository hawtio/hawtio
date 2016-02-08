package io.hawt.git;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static io.hawt.git.GitFacadeTest.assertConfigDirectoryExists;
import static io.hawt.git.GitFacadeTest.assertFileContents;
import static io.hawt.git.GitFacadeTest.createTestGitFacade;

/**
 * Tests we can clone a remote repo
 */
public class GitCloneTest {
    GitFacade git = createTestGitFacade();

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
