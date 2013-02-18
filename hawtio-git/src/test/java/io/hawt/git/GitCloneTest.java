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
        git.setRemoteRepository("git@github.com:hawtio/hawtio-config.git");
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
