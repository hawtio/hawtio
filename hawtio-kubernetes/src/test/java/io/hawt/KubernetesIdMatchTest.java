/**
 * Copyright (C) 2013 the original author or authors.
 * See the notice.md file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt;

import io.hawt.kubernetes.KubernetesService;
import io.hawt.util.Files;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;

/**
 */
public class KubernetesIdMatchTest {
    private static final transient Logger LOG = LoggerFactory.getLogger(KubernetesIdMatchTest.class);

    @Test
    public void testKubernetesId() throws Exception {
        assertKubernetesId(true, "quickstartJavaCamelSpring", "controller.json");
        assertKubernetesId(false, "bar", "controller.json");
        assertKubernetesId(true, "fabric8MQ", "config.json");
        assertKubernetesId(false, "bar", "config.json");
    }

    public static void assertKubernetesId(boolean expected, String id, String fileName) {
        String basedir = System.getProperty("basedir", ".");
        File file = new File(basedir, "src/test/resources/" + fileName);
        Files.assertFileExists(file);

        Pattern pattern = KubernetesService.createKubernetesIdPattern(id);
        boolean actual = KubernetesService.fileTextMatchesPattern(file, pattern);
        assertEquals("expected result for id " + id + " in file " + file.getPath(), expected, actual);
    }


}
