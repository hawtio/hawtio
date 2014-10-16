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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

/**
 */
public class Files {
    private static final transient Logger LOG = LoggerFactory.getLogger(Files.class);

    private static final int BUFFER_SIZE = 8192;

    /**
     * Recursively deletes the given file whether its a file or directory returning the number
     * of files deleted
     */
    public static int recursiveDelete(File file) {
        int answer = 0;
        if (file.isDirectory()) {
            File[] files = file.listFiles();
            if (files != null) {
                for (File child : files) {
                    answer += recursiveDelete(child);
                }
            }
        }
        if (file.delete()) {
            answer += 1;
        }
        return answer;
    }



    public static String getRelativePath(File rootDir, File file) throws IOException {
        String rootPath = rootDir.getCanonicalPath();
        String fullPath = file.getCanonicalPath();
        if (fullPath.startsWith(rootPath)) {
            return fullPath.substring(rootPath.length());
        } else {
            return fullPath;
        }
    }

    /**
     * Reads a {@link File} and returns the data as a byte array
     */
    public static byte[] readBytes(File file) throws IOException {
        FileInputStream fis = null;
        ByteArrayOutputStream bos = null;
        if (file == null) {
            throw new FileNotFoundException("No file specified");
        }
        try {
            fis = new FileInputStream(file);
            bos = new ByteArrayOutputStream();
            byte[] buffer = new byte[BUFFER_SIZE];
            int remaining;
            while ((remaining = fis.read(buffer)) > 0) {
                bos.write(buffer, 0, remaining);
            }
            return bos.toByteArray();
        } finally {
            Closeables.closeQuitely(fis);
            Closeables.closeQuitely(bos);
        }
    }

    public static String getMimeType(File file) {
        try {
            String answer = java.nio.file.Files.probeContentType(file.toPath());
            if (Strings.isNotBlank(answer)) {
                return answer;
            }
        } catch (Throwable e) {
            LOG.warn("Could not find mime type of " + file + ". " + e, e);
        }
        if (file.isDirectory()) {
            return "application/zip";
        }
        String fileName = file.getName();
        if (fileName.endsWith(".xml")) {
            return "application/xml";
        }
        if (fileName.endsWith(".wadl")) {
            return "application/wadl+xml";
        }
        if (fileName.endsWith(".wsdl")) {
            return "application/wsdl+xml";
        }
        if (fileName.endsWith(".xsd")) {
            return "application/xsd+xml";
        }
        if (fileName.endsWith(".json")) {
            return "application/json";
        }
        if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
            return "application/html";
        }
        if (fileName.endsWith(".properties")) {
            return "text/x-java-properties";
        }
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (fileName.endsWith(".png")) {
            return "image/png";
        }
        if (fileName.endsWith(".gif")) {
            return "image/gif";
        }
        if (fileName.endsWith(".svg")) {
            return "image/svg+xml";
        }
        return "text/plain";
    }
}
