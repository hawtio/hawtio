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
import java.io.IOException;
import java.util.List;

import static io.hawt.maven.indexer.MavenIndexFacadeTest.targetDir;
import static org.junit.Assert.assertTrue;

public class FuseEARepoSearchTest {
    private static boolean verbose = false;
    protected static MavenIndexerFacadeMXBean indexer;
    protected static MavenIndexerFacade facade;

    @BeforeClass
    public static void init() throws Exception {
        facade = new MavenIndexerFacade();
        String[] repositories = {"http://repo.fusesource.com/nexus/content/groups/ea@fusesource-ea-repo"};
        facade.setRepositories(repositories);
        facade.setCacheDirectory(new File(targetDir(), "fuse-ea-mavenIndexer"));
        facade.init();
        indexer = facade;
    }

    @AfterClass
    public static void destroy() throws Exception {
        facade.destroy();
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
    public void testFindsCamelVersions() throws Exception {
        List<ArtifactDTO> results = indexer.searchFlat("org.apache.camel", "camel-core", null, "jar", null, null);
        for (ArtifactDTO result : results) {
            System.out.println("camel-core jar version: " + result.getVersion());
        }
        assertTrue("Should have found at last one camel jar!", results.size() > 0);
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
        String searchText = "activemq";
        System.out.println("Searching for text '" + searchText + "'");
        List<ArtifactDTO> results = indexer.searchText(searchText);
        for (ArtifactDTO result : results) {
            System.out.println("Found " + result);
        }

        assertTrue("Should have found at last one result!", results.size() > 0);
    }

    @Test
    public void testFindTestSearchAndPackaging() throws Exception {
        assertSearchAndPackaging("activemq", "xsd", null);
        assertSearchAndPackaging("camel", "xml", "features");
        assertSearchAndPackaging("camel", "maven-archetype", null);
    }

    protected void assertSearchAndPackaging(String searchText, String packaging, String classifier) throws IOException {
        System.out.println("Searching for text '" + searchText + "' packaging " + packaging + " classifier " + classifier);
        List<ArtifactDTO> resultsNoText = indexer.searchTextAndPackaging(null, packaging, classifier);
        List<ArtifactDTO> results = indexer.searchTextAndPackaging(searchText, packaging, classifier);
        for (ArtifactDTO result : results) {
            System.out.println("Found " + result);
        }

        assertTrue("Expect that the text '" + searchText + "' restricts the results but found " + results.size() + " when with no text we found " + resultsNoText.size(), resultsNoText.size() > results.size());
        assertTrue("Should have found at last one result!", results.size() > 0);
    }

}
