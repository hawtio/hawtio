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
package io.hawt.maven.indexer;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.util.List;

import static org.junit.Assert.assertTrue;

public class MavenIndexFacadeTest {
    private static boolean verbose = false;
    protected static MavenIndexerFacade indexer;


    public static File targetDir() {
        String basedir = System.getProperty("basedir", ".");
        return new File(basedir + "/target");
    }

    @BeforeClass
    public static void init() throws Exception {
        indexer = new MavenIndexerFacade();
        indexer.setCacheDirectory(new File(targetDir(), "mavenIndexer"));
        indexer.init();
    }

    @AfterClass
    public static void destroy() throws Exception {
        indexer.destroy();
    }

    @Test
    public void testFindsCamelJars() throws Exception {
        List<ArtifactDTO> results = indexer.search("org.apache.camel", null, null, "jar", null, null);
        if (verbose) {
            for (ArtifactDTO result : results) {
                System.out.println("camel jar: " + result);
            }
        } else {
            System.out.println("Found " + results.size() + " camel jars");
        }
        assertTrue("Should have found at last one camel jar!", results.size() > 0);
    }


    @Test
    public void testGroupIdComplete() throws Exception {
        String text = "org.apache.c";
        List<String> results = indexer.groupIdComplete(text, "jar", null);
        for (String result : results) {
            System.out.println("group IDs starting with '" + text + "': " + result);
        }
        assertTrue("Should have found at last one group ID!", results.size() > 0);
    }


    @Test
    public void testArtifactIdComplete() throws Exception {
        String text = "camel-j";
        List<String> results = indexer.artifactIdComplete("org.apache.camel", text, "jar", null);
        for (String result : results) {
            System.out.println("artifact Ids starting with '" + text + "': " + result);
        }
        assertTrue("Should have found at last one artifact ID!", results.size() > 0);
    }

    @Test
    public void testVersionComplete() throws Exception {
        String groupId = "org.apache.camel";
        String artifactId = "camel-core";
        String text = "2";
        List<String> results = indexer.versionComplete(groupId, artifactId, text, "jar", null);
        for (String result : results) {
            System.out.println("" + groupId + ":" + artifactId + " versions starting with '" + text + "': " + result);
        }
        assertTrue("Should have found at last one camel-core version!", results.size() > 0);
    }

    @Test
    public void testFindJarsWithClassName() throws Exception {
        String className = "DefaultCamelContext";
        System.out.println("Searching for class '" + className + "'");
        List<ArtifactDTO> results = indexer.searchClasses(className);
        for (ArtifactDTO result : results) {
            System.out.println("found jar: " + result);
        }
        assertTrue("Should have found at last one camel jar!", results.size() > 0);
    }


    @Test
    public void testFindTestSearch() throws Exception {
        String[] searchTerms = {"activemq", "camel"};
        for (String searchText : searchTerms) {
            System.out.println("Searching for text '" + searchText + "'");
            List<ArtifactDTO> results = indexer.searchText(searchText);
            for (ArtifactDTO result : results) {
                System.out.println("Found " + result);
            }

            assertTrue("Should have found at last one result!", results.size() > 0);
        }
    }


}
