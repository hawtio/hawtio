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
package io.hawt.util;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static io.hawt.util.Closeables.closeQuitely;
import static io.hawt.util.IOHelper.copy;

/**
 */
public class Zips {
    /**
     * Unzips the given input stream of a ZIP to the given directory
     */
    public static void unzip(InputStream in, File toDir) throws IOException {
        ZipInputStream zis = new ZipInputStream(new BufferedInputStream(in));
        try {
            ZipEntry entry = zis.getNextEntry();
            while (entry != null) {
                if (!entry.isDirectory()) {
                    String entryName = entry.getName();
                    File toFile = new File(toDir, entryName);
                    toFile.getParentFile().mkdirs();
                    OutputStream os = new FileOutputStream(toFile);
                    try {
                        try {
                            copy(zis, os);
                        } finally {
                            zis.closeEntry();
                        }
                    } finally {
                        closeQuitely(os);
                    }
                }
                entry = zis.getNextEntry();
            }
        } finally {
            closeQuitely(zis);
        }
    }
}
