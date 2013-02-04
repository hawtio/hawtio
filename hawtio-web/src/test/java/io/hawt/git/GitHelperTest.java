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

import org.junit.Test;

import java.io.File;
import java.io.IOException;

import static org.junit.Assert.assertTrue;

/**
 * Tests we create a configuration directory
 */
public class GitHelperTest {

    @Test
    public void createsTempFileConfigDirectory() throws Exception {
        GitHelper helper = new GitHelper();
        helper.init();

        assertConfigDirectoryExists(helper);
    }

    protected File assertConfigDirectoryExists(GitHelper helper) throws IOException {
        File confDir = helper.getConfigDirectory();
        System.out.println("Config directory is " + confDir);
        // lets assert the directory exists
        assertTrue("Should have a configDirectory", confDir != null);
        assertTrue("configDirectory should exist", confDir.exists());
        return confDir;
    }
}
