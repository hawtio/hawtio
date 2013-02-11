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
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Tests we create a configuration directory
 */
public class GitFacadeTest {
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
    public void createFileAndListDirectory() throws Exception {
        assertConfigDirectoryExists(git);

        git.write("master", "/ReadMe.md", "Initial commit", "jstrachan", "james.strachan@gmail.com", "Hello world!");

        List<FileInfo> contents = git.contents("/");
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
