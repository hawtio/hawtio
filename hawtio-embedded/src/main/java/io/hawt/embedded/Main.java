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
package io.hawt.embedded;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Slf4jLog;
import org.eclipse.jetty.webapp.WebAppContext;

import javax.management.MBeanServer;
import java.io.File;
import java.io.FilenameFilter;
import java.lang.management.ManagementFactory;

/**
 * A simple way to run hawtio embedded inside a JVM by booting up a Jetty server
 */
public class Main {
    private String contextPath = "/hawtio";
    private int port = 8080;
    private String war;
    private String[] warPaths;

    public static void main(String[] args) {
        if (args.length <= 0) {
            System.out.println("Usage: locationOfHawtioWar portName contextPath");
            return;
        }
        Main main = new Main();
        if (args.length > 0) {
            main.setWar(args[0]);
        }
        if (args.length > 1) {
            String portText = args[1];
            try {
                int port = Integer.parseInt(portText);
                main.setPort(port);
            } catch (NumberFormatException e) {
                System.out.println("Failed to parse port number '" + portText + "'. " + e);
                return;
            }
        }
        if (args.length > 2) {
            main.setContextPath(args[2]);
        }
        try {
            main.run();
        } catch (Exception e) {
            System.out.println("Error: " + e);
            e.printStackTrace();
        }
    }

    public void run() throws Exception {
        System.setProperty("org.eclipse.jetty.util.log.class", Slf4jLog.class.getName());
        Log.setLog(new Slf4jLog("jetty"));

        WebAppContext webapp = new WebAppContext();
        webapp.setContextPath(contextPath);
        String war = findWar(getWar());
        if (war == null) {
            war = findWar(getWarPaths());
        }
        if (war == null) {
            throw new IllegalArgumentException("No war property set!");
        }
        webapp.setWar(war);
        webapp.setParentLoaderPriority(true);

        Server server = new Server(port);
        server.setHandler(webapp);

        System.out.println("About to start war " + war);
        server.start();

        System.out.println("Connect via: http://localhost:" + port + contextPath);
        server.join();
    }

    /**
     * Strategy method where we could use some smarts to find the war
     * using known paths or maybe the local maven repository?
     */
    protected String findWar(String... paths) {
        if (paths != null) {
            for (String path : paths) {
                File file = new File(path);
                if (file.exists()) {
                    if (file.isFile()) {
                        String name = file.getName();
                        if (isWarFileName(name)) {
                            return file.getPath();
                        }
                    }
                    if (file.isDirectory()) {
                        // lets look for a war in this directory
                        File[] wars = file.listFiles(new FilenameFilter() {
                            @Override
                            public boolean accept(File dir, String name) {
                                return isWarFileName(name);
                            }
                        });
                        if (wars != null && wars.length > 0) {
                            return wars[0].getPath();
                        }
                    }
                }
            }
        }
        return null;
    }

    protected boolean isWarFileName(String name) {
        return name.toLowerCase().endsWith(".war");
    }

    // Properties
    //-------------------------------------------------------------------------
    public String getContextPath() {
        return contextPath;
    }

    public void setContextPath(String contextPath) {
        this.contextPath = contextPath;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public String getWar() {
        return war;
    }

    public void setWar(String war) {
        this.war = war;
    }

    public String[] getWarPaths() {
        return warPaths;
    }

    /**
     * Sets a list of paths searched for to find the war if no war property is specified
     * via {@link #setWar(String)}
     */
    public void setWarPaths(String... warPaths) {
        this.warPaths = warPaths;
    }
}
