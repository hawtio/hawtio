/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.git;

import org.eclipse.jgit.api.Status;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;
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
        String readMeActual = assertReadFileContents(readMePath);
        assertEquals("content of " + readMePath, readMeContent, readMeActual);
        String anotherActual = assertReadFileContents(anotherPath);
        assertEquals("content of " + anotherPath, anotherContent, anotherActual);

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
        FileContents contents = git.read(branch, readMePath);
        assertNotNull("Should have FileContents", contents);
        assertTrue("should be a file!", !contents.isDirectory());
        String text = contents.getText();
        assertNotNull("contents should contain text", text);
        return text;
    }

    protected File assertConfigDirectoryExists(GitFacade helper) throws IOException {
        File confDir = helper.getConfigDirectory();
        System.out.println("Config directory is " + confDir);
        // lets assert the directory exists
        assertTrue("Should have a configDirectory", confDir != null);
        assertTrue("configDirectory should exist", confDir.exists());
        return confDir;
    }
}
