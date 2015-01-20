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
package io.hawt.mvn;

import io.hawt.util.IOHelper;
import io.hawt.util.Zips;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 */
public class MvnUrlTest {
    @Test
    public void testUrl() throws Exception {
        String mvnCoords = "mvn:io.fabric8/fabric8-profiles/1.2.0.Beta4/zip";

        URL url = new URL(mvnCoords);
        InputStream in = url.openStream();
        assertNotNull("could not load " + url, in);

        File outDir = new File(getBaseDir(), "target/data/mvnDownloadTest/" + getClass().getName());
        outDir.mkdirs();

        Zips.unzip(in, outDir);

        File[] files = outDir.listFiles();
        assertNotNull("Should have child folders in " + outDir, files);
        assertTrue("Should have at least one child folder in + " + outDir, files.length > 0);

        System.out.println("Has unzipped files:");
        for (File file : files) {
            System.out.println("  " + file);
        }
    }

    public static File getBaseDir() {
        String basedir = System.getProperty("basedir", ".");
        return new File(basedir);
    }

}
