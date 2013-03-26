package io.hawt.git;

import org.eclipse.jgit.api.Status;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import javax.management.ObjectName;
import java.io.File;
import java.io.IOException;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

/**
 * Tests we create a configuration directory
 */
public class GitFacadeTest {
    GitFacade git = new GitFacade();
    String branch = "master";
    String authorName = "jstrachan";
    String authorEmail = "james.strachan@gmail.com";

    @Before
    public void init() throws Exception {
        git.setCloneRemoteRepoOnStartup(false);
        git.init();
    }

    @After
    public void destroy() throws Exception {
        git.destroy();
    }

    @Test
    public void createFileAndListDirectory() throws Exception {
        assertConfigDirectoryExists(git);

        String readMeContent = "Hello world!";
        String anotherContent = "Something else!";
        String readMePath = "/ReadMe.md";
        String anotherPath = "/Another.md";

        git.write(branch, readMePath, "Initial commit", authorName, authorEmail, readMeContent);
        git.write(branch, anotherPath, "Second commit", authorName, authorEmail, anotherContent);

        List<FileInfo> contents = assertReadDirectory("/");
        assertNotNull("No contents!", contents);
        assertTrue("Should have some files", contents.size() > 0);

        for (FileInfo content : contents) {
            System.out.println("have file " + content);
        }

        // now lets assert that a git status has no pending files to add...
        Status status = git.status();
        assertNotNull("No status!", status);
        assertEquals("added size", 0, status.getAdded().size());
        assertEquals("untracked size", 0, status.getUntracked().size());

        // now lets read the files...
        String readMeActual = assertReadFileContents(readMePath, readMeContent);
        String anotherActual = assertReadFileContents(anotherPath, anotherContent);

        System.out.println(readMePath + " = " + readMeActual);
        System.out.println(anotherPath + " = " + anotherActual);


        // now lets try remove one of the files we created
        git.remove(branch, anotherPath, "Remove another thingy", authorName, authorEmail);

        // now lets assert that we can't find the file...
        contents = assertReadDirectory("/");
        assertNotNull("No contents!", contents);
        assertTrue("Should have some files", contents.size() > 0);
        for (FileInfo content : contents) {
            assertNotEquals("Should not still have the deleted file!", "Another.md", content.getName());
        }

        String shouldFail = null;
        try {
            shouldFail = assertReadFileContents(anotherPath);
            fail("Should have thrown an exception!");
        } catch (Throwable e) {
            // expected exception!
        }
        assertNull("Should not find any data", shouldFail);


        // lets update the file
        String readMeContent2 = "Goodbye world!";
        git.write(branch, readMePath, "Updating the content to goodbye", authorName, authorEmail, readMeContent2);
        assertReadFileContents(readMePath, readMeContent2);

        // now lets do a diff on this file
        String blobPath = trimLeadingSlash(readMePath);
        String diff = git.diff(null, null, blobPath);
        assertNotNull("Should have returned a diff!");
        System.out.println("Diff of " + readMePath);
        System.out.println(diff);
        System.out.println();

        // now lets try find the history and revert to the first version
        List<CommitInfo> readMeHistory = git.history(null, blobPath, 0);
        assertTrue("Should have at least 2 items in the history but got " + readMeHistory.size(), readMeHistory.size() >= 2);
        String objectId = readMeHistory.get(readMeHistory.size() - 1).getName();
        git.revertTo(branch, objectId, blobPath, "Reverting to first version " + objectId, authorName, authorEmail);
        assertReadFileContents(readMePath, readMeContent);


        // now lets find out the log.
        String[] paths = {null, readMePath, anotherPath};
        for (String path : paths) {
            String name = trimLeadingSlash(path);
            List<CommitInfo> log = git.history(null, name, 0);
            System.out.println("Showing commits for path " + name);
            for (CommitInfo info : log) {
                System.out.println("  " + info);

                if (path != null) {
                    String content = git.getContent(info.getName(), name);
                    System.out.println("    = " + content);
                }
            }
            System.out.println();
        }

        // now lets make a new git facade to check we can work with existing repos
        GitFacade anotherGit = new GitFacade();
        anotherGit.setObjectName(new ObjectName("io.hawt.git:type=GitFacadePart2"));
        anotherGit.setConfigDirectory(git.getConfigDirectory());
        anotherGit.init();

        String path = trimLeadingSlash(anotherPath);
        List<CommitInfo> log = git.history(null, path, 0);
        assertTrue("should have more than one commit info", log.size() > 0);

        System.out.println("Using existing repo and showing commits for path " + path);
        for (CommitInfo info : log) {
            System.out.println("  " + info);

            String content = git.getContent(info.getName(), path);
            System.out.println("    = " + content);
        }


        // write some JSON files then lets combine them in a single read
        String jsonDir = "/foo";
        git.write(branch, jsonDir + "/" + "1.json", "Initial commit", authorName, authorEmail, "{ key: 1, name: 'James'}");
        git.write(branch, jsonDir + "/" + "2.json", "Initial commit", authorName, authorEmail, "{ key: 2, name: 'Stan'}");

        // now lets read the JSON for the directory
        String json = git.readJsonChildContent(branch, jsonDir, "*.json", null);
        System.out.println("Got JSON: " + json);
        assertTrue("JSON should include James but was: " + json, json.contains("James"));

        json = git.readJsonChildContent(branch, jsonDir, "*.json", "James");
        assertTrue("JSON should include James but was: " + json, json.contains("James"));

        json = git.readJsonChildContent(branch, jsonDir, "*.json", "Stan");
        assertFalse("JSON should not include James but was: " + json, json.contains("James"));
    }

    protected String assertReadFileContents(String path, String expectedContents) throws IOException {
        String readMeActual = assertReadFileContents(path);
        assertEquals("content of " + path, expectedContents, readMeActual);
        return readMeActual;
    }

    public static String trimLeadingSlash(String path) {
        String name = path;
        if (name != null && name.startsWith("/")) {
            name = name.substring(1);
        }
        return name;
    }

    private List<FileInfo> assertReadDirectory(String path) throws IOException {
        FileContents contents = git.read(branch, path);
        assertNotNull("Should have FileContents", contents);
        assertTrue("should be a directory!", contents.isDirectory());
        String text = contents.getText();
        assertNull("Should not have text content", text);
        List<FileInfo> children = contents.getChildren();
        assertNotNull("Should have children even if empty", children);
        return children;
    }

    protected String assertReadFileContents(String readMePath) throws IOException {
        return assertFileContents(git, branch, readMePath);
    }

    public static String assertFileContents(GitFacade git, String branchName, String filePath) throws IOException {
        FileContents contents = git.read(branchName, filePath);
        assertNotNull("Should have FileContents", contents);
        assertTrue("should be a file!", !contents.isDirectory());
        String text = contents.getText();
        assertNotNull("contents should contain text", text);
        return text;
    }

    public static File assertConfigDirectoryExists(GitFacade helper) throws IOException {
        File confDir = helper.getConfigDirectory();
        System.out.println("Config directory is " + confDir);
        // lets assert the directory exists
        assertTrue("Should have a configDirectory", confDir != null);
        assertTrue("configDirectory should exist", confDir.exists());
        return confDir;
    }
}
