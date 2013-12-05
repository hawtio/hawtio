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
            if (idx <= 0) {
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
