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
package io.hawt.git;

import java.io.File;
import java.io.IOException;

/**
 */
public class FileInfo {
    private final String path;
    private final String name;
    private final long lastModified;
    private final long length;
    private final boolean directory;

    public static FileInfo createFileInfo(File rootDir, File file) {
        String path = getRelativePath(rootDir, file);
        return new FileInfo(path, file.getName(), file.lastModified(), file.length(), file.isDirectory());
    }

    public static String getRelativePath(File rootDir, File file) {
        try {
            String rootPath = rootDir.getCanonicalPath();
            String fullPath = file.getCanonicalPath();
            if (fullPath.startsWith(rootPath)) {
                return fullPath.substring(rootPath.length());
            } else {
                return fullPath;
            }
        } catch (IOException e) {
            throw new RuntimeIOException(e);
        }
    }

    public FileInfo(String path, String name, long lastModified, long length, boolean directory) {
        this.path = path;
        this.name = name;
        this.lastModified = lastModified;
        this.length = length;
        this.directory = directory;
    }

    @Override
    public String toString() {
        return "FileInfo(" + path + ")";
    }

    public boolean isDirectory() {
        return directory;
    }

    public long getLastModified() {
        return lastModified;
    }

    public long getLength() {
        return length;
    }

    public String getName() {
        return name;
    }

    public String getPath() {
        return path;
    }
}
