/*
 * Copyright (C) 2013 the original author or authors.
 * See the NOTICE file distributed with this work for additional
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

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 */
public class Files {
    private static final Logger LOG = LoggerFactory.getLogger(Files.class);

    private static final int BUFFER_SIZE = 8192;

    /**
     * Copy the source {@link File} to the target {@link File}.
     */
    public static void copy(File source, File target) throws IOException {
        if (!source.exists()) {
            throw new FileNotFoundException("Source file not found:" + source.getAbsolutePath());
        }

        if (!target.exists() && !target.getParentFile().exists() && !target.getParentFile().mkdirs()) {
            throw new IOException("Can't create target directory:" + target.getParentFile().getAbsolutePath());
        }
        FileInputStream is = new FileInputStream(source);
        FileOutputStream os = new FileOutputStream(target);
        IOHelper.copy(is, os);
    }


    /**
     * Recursively deletes the given file whether it's a file or directory returning the number
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
            Closeables.closeQuietly(fis);
            Closeables.closeQuietly(bos);
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

    /**
     * Throws an exception if the given file or directory does not exist
     */
    public static void assertExists(File file) {
        if (!file.exists()) {
            throw new IllegalArgumentException(file + " does not exist");
        }
    }

    /**
     * Throws an exception if the given file does not exist
     */
    public static void assertFileExists(File file) {
        assertExists(file);
        if (!file.isFile()) {
            throw new IllegalArgumentException(file + " is not a file!");
        }
    }

    /**
     * Throws an exception if the given file does not exist
     */
    public static void assertDirectoryExists(File file) {
        assertExists(file);
        if (!file.isDirectory()) {
            throw new IllegalArgumentException(file + " is not a directory!");
        }
    }
}
