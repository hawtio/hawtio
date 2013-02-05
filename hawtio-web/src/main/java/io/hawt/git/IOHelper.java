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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.Closeable;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

/**
 * A collection of IO helpers
 */
public class IOHelper {
    public static final int BUFFER_SIZE = 64 * 1024;

    private static final transient Logger LOG = LoggerFactory.getLogger(IOHelper.class);

    public static String readFully(File file) throws IOException {
        return readFully(new BufferedReader(new FileReader(file)));
    }

    /**
     * Reads the entire reader into memory as a String
     */
    public static String readFully(BufferedReader reader) throws IOException {
        if (reader == null) {
            return null;
        }

        StringBuilder sb = new StringBuilder(BUFFER_SIZE);
        char[] buf = new char[BUFFER_SIZE];
        try {
            int len;
            // read until we reach then end which is the -1 marker
            while ((len = reader.read(buf)) != -1) {
                sb.append(buf, 0, len);
            }
        } finally {
            IOHelper.close(reader, "reader", LOG);
        }

        return sb.toString();
    }

    /**
     * Closes the given resource if it is available, logging any closing exceptions to the given log.
     *
     * @param closeable the object to close
     * @param name      the name of the resource
     * @param log       the log to use when reporting closure warnings, will use this class's own {@link Logger} if <tt>log == null</tt>
     */
    public static void close(Closeable closeable, String name, Logger log) {
        if (closeable != null) {
            try {
                closeable.close();
            } catch (IOException e) {
                if (log == null) {
                    // then fallback to use the own Logger
                    log = LOG;
                }
                if (name != null) {
                    log.warn("Cannot close: " + name + ". Reason: " + e.getMessage(), e);
                } else {
                    log.warn("Cannot close. Reason: " + e.getMessage(), e);
                }
            }
        }
    }

}
