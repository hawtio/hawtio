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
package io.hawt.app;

import java.awt.*;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;

import io.hawt.embedded.Main;

public class App {
    private static final String WAR_FILENAME = "hawtio.war";
    private static final int KB = 1024;

    public static void main(String[] args) {

        Object val = System.getProperty("hawtio.authenticationEnabled");
        if (val == null) {
            System.setProperty("hawtio.authenticationEnabled", "false");
        }

        Main main = new Main();

        try {
            String virtualMachineClass = "com.sun.tools.attach.VirtualMachine";
            try {
                loadClass(virtualMachineClass, App.class.getClassLoader(), Thread.currentThread().getContextClassLoader());
            } catch (Exception e) {
                // lets try find the tools.jar instead
                Set<String> paths = new HashSet<>();
                String javaHome = System.getProperty("java.home", ".");
                addPath(paths, javaHome);

                // now lets try the JAVA_HOME environment variable just in case
                javaHome = System.getenv("JAVA_HOME");
                if (javaHome != null && javaHome.length() > 0) {
                    addPath(paths, javaHome);
                }

                boolean found = false;
                for (String path : paths) {
                    File file = new File(path, "lib/tools.jar");
                    if (file.exists()) {
                        found = true;
                        String url = file.toURI().toURL().toString();
                        main.setExtraClassPath(url);
                        break;
                    }
                }
                if (!found) {
                    System.err.println(String.format(
                        "Failed to load class %s and find tools.jar in directories %s. %s",
                        virtualMachineClass, paths, e));
                }
            }

            ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
            URL resource = classLoader.getResource(WAR_FILENAME);
            if (resource == null) {
                System.err.println(String.format("Could not find the %s on classpath!", WAR_FILENAME));
                System.exit(1);
            }
            File warFile = File.createTempFile("hawtio-", ".war");
            writeStreamTo(resource.openStream(), new FileOutputStream(warFile), 64 * KB);

            String warPath = warFile.getCanonicalPath();
            main.setWar(warPath);
        } catch (Exception e) {
            System.err.println("Failed to create hawtio: " + e.getMessage());
            e.printStackTrace();
            return;
        }

        if (!main.parseArguments(args) || main.isHelp()) {
            main.showOptions();
        } else {
            try {
                main.run();

                // should we open the url
                int port = main.getPort();
                String url = "http://localhost:" + port + main.getContextPath();
                // set what is the url
                System.setProperty("hawtio.url", url);

                String open = main.isOpenUrl() ? "true" : "false";
                // JVM system override the main option
                boolean openUrl = "true".equals(System.getProperty("hawtio.openUrl", open));
                if (openUrl && Desktop.isDesktopSupported()) {
                    try {
                        Desktop.getDesktop().browse(new URI(url));
                    } catch (Exception e) {
                        System.err.println(String.format(
                            "Failed to open browser session, to access hawtio visit \"%s\"",
                            url));
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed running hawtio: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    protected static void addPath(Set<String> paths, String path) {
        paths.add(path);
        String jreSuffix = File.separator + "jre";
        if (path.endsWith(jreSuffix)) {
            path = path.substring(0, path.length() - jreSuffix.length());
            paths.add(path);
        }
    }

    private static Class<?> loadClass(String name, ClassLoader... classLoaders) throws ClassNotFoundException {
        for (ClassLoader classLoader : classLoaders) {
            try {
                return classLoader.loadClass(name);
            } catch (ClassNotFoundException e) {
                // ignore
            }
        }
        return Class.forName(name);
    }

    public static int writeStreamTo(final InputStream input, final OutputStream output, int bufferSize) throws IOException {
        int available = Math.min(input.available(), 256 * KB);
        byte[] buffer = new byte[Math.max(bufferSize, available)];
        int answer = 0;
        int count = input.read(buffer);
        while (count >= 0) {
            output.write(buffer, 0, count);
            answer += count;
            count = input.read(buffer);
        }
        return answer;
    }

}
