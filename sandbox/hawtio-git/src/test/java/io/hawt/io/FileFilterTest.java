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
