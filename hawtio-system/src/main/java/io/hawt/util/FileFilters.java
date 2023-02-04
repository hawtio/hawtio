package io.hawt.util;

import java.io.File;
import java.io.FileFilter;

/**
 * A number of helper functions for creating {@link FileFilter} objects on a {@link File} object.
 */
public class FileFilters {
    private static final FileFilter TRUE_FILTER = new FileFilter() {
        @Override
        public String toString() {
            return "TrueFileFilter";
        }

        @Override
        public boolean accept(File pathname) {
            return true;
        }
    };

    public static FileFilter createFileFilter(String wildcard) {
        if (Strings.isNotBlank(wildcard)) {
            int idx = wildcard.indexOf('*');
            if (idx < 0) {
                return nameEqualsFilter(wildcard);
            }
            int lastIdx = wildcard.lastIndexOf(idx);
            if (lastIdx < 0) {
                lastIdx = idx;
            }
            FileFilter endsWith = nameEndsWithFilter(wildcard.substring(lastIdx + 1));
            if (idx == 0) {
                return endsWith;
            } else {
                return andFilter(nameStartsWithFilter(wildcard.substring(0, idx)), endsWith);
            }
        }
        return trueFilter();
    }

    public static FileFilter nameEqualsFilter(final String name) {
        return new FileFilter() {
            @Override
            public String toString() {
                return "FileNameEqualsFilter(" + name + ")";
            }

            @Override
            public boolean accept(File file) {
                return name.equals(file.getName());
            }
        };
    }

    public static FileFilter nameStartsWithFilter(final String name) {
        return new FileFilter() {
            @Override
            public String toString() {
                return "FileNameStartsWithFilter(" + name + ")";
            }

            @Override
            public boolean accept(File file) {
                return file.getName().startsWith(name);
            }
        };
    }

    public static FileFilter nameEndsWithFilter(final String name) {
        return new FileFilter() {
            @Override
            public String toString() {
                return "FileNameEndsWithFilter(" + name + ")";
            }

            @Override
            public boolean accept(File file) {
                return file.getName().endsWith(name);
            }
        };
    }

    public static FileFilter andFilter(final FileFilter filter1, final FileFilter filter2) {
        return new FileFilter() {
            @Override
            public String toString() {
                return "AndFilter(" + filter1 + " && " + filter2 + ")";
            }

            @Override
            public boolean accept(File file) {
                return filter1.accept(file) && filter2.accept(file);
            }
        };
    }

    public static FileFilter trueFilter() {
        return TRUE_FILTER;
    }
}
