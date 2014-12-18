package io.hawt.git;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import javax.management.ObjectName;

import io.hawt.util.Files;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

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
    GitFacade git = createTestGitFacade();

    public static void main(String[] args) {
        GitFacadeTest test = new GitFacadeTest();
        try {
            test.init();
            test.createFileAndListDirectory();
            test.destroy();
        } catch (Throwable e) {
            System.out.println("FAILED: " + e);
            e.printStackTrace();
        }
    }
    public static File targetDir() {
        String basedir = System.getProperty("basedir", ".");
        return new File(basedir + "/target");
    }

    public static GitFacade createTestGitFacade() {
        return createTestGitFacade("hawtio-config");
    }

    public static GitFacade createTestGitFacade(String directory) {
        GitFacade answer = new GitFacade();
        File configDir = new File(targetDir(), directory);
        if (configDir.exists()) {
            Files.recursiveDelete(configDir);
        }
        configDir.mkdirs();
        System.out.println("Using git config directory " + configDir.getAbsolutePath());
        answer.setConfigDirectory(configDir);
        return answer;
    }

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
    public void testExists() throws Exception {
        assertConfigDirectoryExists(git);

        String readMeContent = "Hello world!";
        String anotherContent = "Something else!";
        String readMePath = "/ReadMe.md";
        String anotherPath = "/Another.md";

        git.write(branch, readMePath, "Initial commit", authorName, authorEmail, readMeContent);
        git.write(branch, anotherPath, "Second commit", authorName, authorEmail, anotherContent);

        FileInfo info = git.exists(branch, "ReadMe.md");
        assertNotNull(info);
        assertEquals("ReadMe.md", info.getName());

        FileInfo info2 = git.exists(branch, "xxReadMe.md");
        assertNull(info2);

        info = git.exists(branch, "readme.md");
        assertNotNull(info);
        assertEquals("ReadMe.md", info.getName());

        info = git.exists(branch, "unknown.md");
        assertNull(info);
    }

    @Test
    @Ignore
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

        String branch = git.currentBranch();
        System.out.println("Branch is: " + branch);

        // now lets read the files...
        String readMeActual = assertReadFileContents(readMePath, readMeContent);
        String anotherActual = assertReadFileContents(anotherPath, anotherContent);

        System.out.println(readMePath + " = " + readMeActual);
        System.out.println(anotherPath + " = " + anotherActual);


        // now lets try remove one of the files we created
        git.remove(this.branch, anotherPath, "Remove another thingy", authorName, authorEmail);

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
        git.write(this.branch, readMePath, "Updating the content to goodbye", authorName, authorEmail, readMeContent2);
        assertReadFileContents(readMePath, readMeContent2);

        // now lets do a diff on this file
        String blobPath = GitFacade.trimLeadingSlash(readMePath);
        String diff = git.diff(null, null, blobPath);
        assertNotNull("Should have returned a diff!");
        System.out.println("Diff of " + readMePath);
        System.out.println(diff);
        System.out.println();

        // now lets try find the history and revert to the first version
        List<CommitInfo> readMeHistory = git.history(branch, null, blobPath, 0);
        assertTrue("Should have at least 2 items in the history but got " + readMeHistory.size(), readMeHistory.size() >= 2);
        String objectId = readMeHistory.get(readMeHistory.size() - 1).getName();
        git.revertTo(this.branch, objectId, blobPath, "Reverting to first version " + objectId, authorName, authorEmail);
        assertReadFileContents(readMePath, readMeContent);


        // now lets find out the log.
        String[] paths = {null, readMePath, anotherPath};
        for (String path : paths) {
            String name = GitFacade.trimLeadingSlash(path);
            List<CommitInfo> log = git.history(branch, null, name, 0);
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

        // now lets try rename a file
        String newReadMePath = "NewReadMeFile.md";
        git.rename(this.branch, readMePath, newReadMePath, "Renaming file", authorName, authorEmail);
        assertReadFileContents(newReadMePath, readMeContent);

        // now lets try move it to a completely different directory
        String newDirectoryReadMePath = "another/thing/NewReadMeFile.md";
        git.rename(this.branch, newReadMePath, newDirectoryReadMePath, "Moving file to another directory", authorName, authorEmail);
        assertReadFileContents(newDirectoryReadMePath, readMeContent);

        // now lets make a new git facade to check we can work with existing repos
        GitFacade anotherGit = createTestGitFacade();
        anotherGit.setObjectName(new ObjectName("hawtio:type=GitFacadePart2"));
        anotherGit.setConfigDirectory(git.getRootGitDirectory());
        anotherGit.init();

        String path = GitFacade.trimLeadingSlash(anotherPath);
        List<CommitInfo> log = git.history(branch, null, path, 0);
        assertTrue("should have more than one commit info", log.size() > 0);

        System.out.println("Using existing repo and showing commits for path " + path);
        for (CommitInfo info : log) {
            System.out.println("  " + info);

            String content = git.getContent(info.getName(), path);
            System.out.println("    = " + content);
        }


        // write some JSON files then lets combine them in a single read
        String jsonDir = "/foo";
        git.write(this.branch, jsonDir + "/" + "1.json", "Initial commit", authorName, authorEmail, "{ key: 1, name: 'James'}");
        git.write(this.branch, jsonDir + "/" + "2.json", "Initial commit", authorName, authorEmail, "{ key: 2, name: 'Stan'}");

        // now lets read the JSON for the directory
        String json = git.readJsonChildContent(this.branch, jsonDir, "*.json", null);
        System.out.println("Got JSON: " + json);
        assertTrue("JSON should include James but was: " + json, json.contains("James"));

        json = git.readJsonChildContent(this.branch, jsonDir, "*.json", "James");
        assertTrue("JSON should include James but was: " + json, json.contains("James"));

        json = git.readJsonChildContent(this.branch, jsonDir, "*.json", "Stan");
        assertFalse("JSON should not include James but was: " + json, json.contains("James"));

        // now lets write some XML with namespaces
        String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                + "<beans xmlns=\"http://www.springframework.org/schema/beans\"\n"
                + "       xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n"
                + "       xmlns:amq=\"http://activemq.apache.org/schema/core\"\n"
                + "       xsi:schemaLocation=\"\n"
                + "       http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd\n"
                + "       http://camel.apache.org/schema/spring http://camel.apache.org/schema/spring/camel-spring.xsd\n"
                + "       http://activemq.apache.org/schema/core http://activemq.apache.org/schema/core/activemq-core.xsd\">\n"
                + " <camelContext xmlns=\"http://camel.apache.org/schema/spring\"/>\n"
                + " <broker xmlns=\"http://activemq.apache.org/schema/core\" brokerName=\"broker1\" useJmx=\"true\"/>\n"
                + "</beans>\n";

        git.write(this.branch, "spring.xml", "Added a spring XML", authorName, authorEmail, xml);

        FileContents rootContents = git.read(this.branch, "/");
        assertTrue("Should be directory", rootContents.isDirectory());
        List<FileInfo> children = rootContents.getChildren();
        for (FileInfo child : children) {
            if (child.getName().equals("spring.xml")) {
                String[] xmlNamespaces = child.getXmlNamespaces();
                assertNotNull("Should have some XML namespaces!", xmlNamespaces);
                List<String> list = Arrays.asList(xmlNamespaces);
                System.out.println("Found spring XML!" + child + " with namespaces " + list);
                assertTrue("Should contain camel-spring but was " + list, list.contains("http://camel.apache.org/schema/spring"));
            }
        }


        // now lets test the completions
        assertCompletePaths("", true, "another", "foo");
        assertCompletePaths("/", true, "/another", "/foo");
        assertCompletePaths("/another", true, "/another/thing");
        assertCompletePaths("another", true, "another/thing");
        assertCompletePaths("/foo", false, "/foo/1.json", "/foo/2.json");
        assertCompletePaths("foo", false, "foo/1.json", "foo/2.json");
    }

    protected void assertCompletePaths(String completePath, boolean directoriesOnly, String... expected) {
        List<String> expectedList = Arrays.asList(expected);
        List<String> paths = git.completePath(this.branch, completePath, directoriesOnly);
        assertEquals("complete paths for '" + completePath + "' and directoriesOnly " + directoriesOnly, expectedList, paths);
    }

    protected String assertReadFileContents(String path, String expectedContents) throws IOException, GitAPIException {
        String readMeActual = assertReadFileContents(path);
        assertEquals("content of " + path, expectedContents, readMeActual);
        return readMeActual;
    }

    private List<FileInfo> assertReadDirectory(String path) throws IOException, GitAPIException {
        FileContents contents = git.read(branch, path);
        assertNotNull("Should have FileContents", contents);
        assertTrue("should be a directory!", contents.isDirectory());
        String text = contents.getText();
        assertNull("Should not have text content", text);
        List<FileInfo> children = contents.getChildren();
        assertNotNull("Should have children even if empty", children);
        return children;
    }

    protected String assertReadFileContents(String readMePath) throws IOException, GitAPIException {
        return assertFileContents(git, branch, readMePath);
    }

    public static String assertFileContents(GitFacade git, String branchName, String filePath) throws IOException, GitAPIException {
        FileContents contents = git.read(branchName, filePath);
        assertNotNull("Should have FileContents", contents);
        assertTrue("should be a file!", !contents.isDirectory());
        String text = contents.getText();
        assertNotNull("contents should contain text", text);
        return text;
    }

    public static File assertConfigDirectoryExists(GitFacade helper) throws IOException {
        File confDir = helper.getRootGitDirectory();
        System.out.println("Config directory is " + confDir);
        // lets assert the directory exists
        assertTrue("Should have a configDirectory", confDir != null);
        assertTrue("configDirectory should exist", confDir.exists());
        return confDir;
    }
}
