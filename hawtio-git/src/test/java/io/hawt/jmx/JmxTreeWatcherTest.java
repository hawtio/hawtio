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
package io.hawt.jmx;

import io.hawt.git.GitFacade;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 */
public class JmxTreeWatcherTest {
    JmxTreeWatcher treeWatcher = new JmxTreeWatcher();

    @Before
    public void init() throws Exception {
        treeWatcher.init();
    }

    @After
    public void destroy() throws Exception {
        treeWatcher.destroy();
    }

    @Test
    public void testNotificationsOnNewMBeans() throws Exception {
        long value1 = treeWatcher.getCounter();

        // now lets register a new mbean
        GitFacade git = new GitFacade();
        git.setCloneRemoteRepoOnStartup(false);
        git.init();

        long value2 = treeWatcher.getCounter();
        assertCounterGreater(value1, value2);
        git.destroy();

        long value3 = treeWatcher.getCounter();
        assertCounterGreater(value2, value3);

    }

    private void assertCounterGreater(long value1, long value2) {
        assertTrue("Counter: " + value1 + " should be less than counter 2 " + value2, value1 < value2);
    }
}
