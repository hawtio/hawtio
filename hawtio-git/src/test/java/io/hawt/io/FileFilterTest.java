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
package io.hawt.io;

import io.hawt.util.FileFilters;
import org.junit.Test;

import java.io.File;
import java.io.FileFilter;

import static org.junit.Assert.assertEquals;

/**
 */
public class FileFilterTest {

    @Test
    public void testFileFilters() throws Exception {
        assertFilterMatches("Foo.json", "*", true);
        assertFilterMatches("Foo.json", "*.json", true);
        assertFilterMatches("Foo.json", "Foo*", true);
        assertFilterMatches("Foo.json", "Foo*.json", true);
        assertFilterMatches("Foo.json", "F*.json", true);
        assertFilterMatches("Foo.json", "Foo.json", true);
        assertFilterMatches("/foo/bar/Foo.json", "Foo.json", true);

        assertFilterMatches("Foo.json", "Fooo.json", false);
        assertFilterMatches("Foo.json", "*.txt", false);
        assertFilterMatches("Foo.json", "Fou*", false);
    }

    public static void assertFilterMatches(String fileName, String wildcard, boolean expected) {
        File file = new File(fileName);
        FileFilter filter = FileFilters.createFileFilter(wildcard);
        boolean actual = filter.accept(file);
        assertEquals("Comparison of file name: " + fileName + " with wildcard: " + wildcard, expected, actual);
    }

}
