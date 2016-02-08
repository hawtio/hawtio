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
package io.hawt.git;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import io.hawt.util.Zips;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static io.hawt.util.Closeables.closeQuietly;

/**
 * Helper functions for working with Git
 */
public class GitHelper {
    private static final transient Logger LOG = LoggerFactory.getLogger(GitHelper.class);

    public static void doUploadFiles(WriteContext context, File folder, boolean unzip, List<File> uploadedFiles) throws IOException, GitAPIException {
        if (uploadedFiles != null) {
            for (File uploadedFile : uploadedFiles) {
                String name = uploadedFile.getName();
                if (unzip && name.endsWith(".zip")) {
                    // lets unzip zip files into a folder

                    File unzipDir = uploadedFile.getParentFile();

                    ZipInputStream zis = new ZipInputStream(new FileInputStream(uploadedFile));
                    try {
                        ZipEntry entry = zis.getNextEntry();
                        if (!entry.isDirectory()) {
                            String folderName = name.substring(0, name.length() - 4);
                            unzipDir = new File(uploadedFile.getParentFile(), folderName);
                        }
                    } finally {
                        closeQuietly(zis);
                    }

                    Zips.unzip(new FileInputStream(uploadedFile), unzipDir);
                    uploadedFile.delete();
                    uploadedFile = unzipDir;
                }
                LOG.info("Adding to folder: " + folder + " file: " + uploadedFile + " to git");
                context.addFile(uploadedFile);
            }
        }
    }
}
