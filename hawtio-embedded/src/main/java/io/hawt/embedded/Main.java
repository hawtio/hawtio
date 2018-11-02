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
package io.hawt.embedded;

import java.io.File;
import java.io.FilenameFilter;
import java.net.InetAddress;
import java.net.InetSocketAddress;

import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.SslConnectionFactory;
import org.eclipse.jetty.server.handler.HandlerCollection;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Slf4jLog;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.eclipse.jetty.webapp.WebAppContext;

/**
 * A simple way to run hawtio embedded inside a JVM by booting up a Jetty server
 */
public class Main {
    private Options options;
    private boolean welcome = true;

    public Main() {
        options = new Options();
        options.init();
    }

    public static void main(String[] args) {
        Main main = new Main();

        if (!main.parseArguments(args) || main.isHelp()) {
            main.showOptions();
            return;
        }

        doRun(main);
    }

    public boolean parseArguments(String[] args) {
        return options.parseArguments(args);
    }

    public void showOptions() {
        options.showOptions();
    }

    public static void doRun(Main main) {
        try {
            main.run();
        } catch (Exception e) {
            System.out.println("Error: " + e);
            e.printStackTrace();
        }
    }

    public void run() throws Exception {
        run(options.isJointServerThread());
    }

    public void run(boolean join) throws Exception {
        System.setProperty("org.eclipse.jetty.util.log.class", Slf4jLog.class.getName());
        Slf4jLog log = new Slf4jLog("jetty");
        Log.setLog(log);

        Server server = new Server(new InetSocketAddress(InetAddress.getByName(options.getHost()), options.getPort()));

        HandlerCollection handlers = new HandlerCollection();
        handlers.setServer(server);
        server.setHandler(handlers);
        String scheme = "http";
        if (null != options.getKeyStore()) {
            System.out.println("Configuring SSL");
            SslContextFactory sslcontf = new SslContextFactory();
            HttpConfiguration httpconf = new HttpConfiguration();
            sslcontf.setKeyStorePath(options.getKeyStore());
            if (null != options.getKeyStorePass()) {
                sslcontf.setKeyStorePassword(options.getKeyStorePass());
            } else {
                System.out.println("Attempting to open keystore with no password...");
            }
            try (ServerConnector sslconn = new ServerConnector(server, new SslConnectionFactory(sslcontf, "http/1.1"), new HttpConnectionFactory(httpconf));) {
                sslconn.setPort(options.getPort());
                server.setConnectors(new Connector[] { sslconn });

            }
            scheme = "https";
        }
        String sysScheme = System.getProperty("hawtio.redirect.scheme");
        if (null == sysScheme) {
            System.out.println("Implicitly setting Scheme = " + scheme);
            System.setProperty("hawtio.redirect.scheme", scheme);
        } else {
            System.out.println("Scheme Was Set Explicitly To = " + scheme);
            scheme = sysScheme;
        }
        WebAppContext webapp = new WebAppContext();
        webapp.setServer(server);
        webapp.setContextPath(options.getContextPath());
        String war = findWar(options.getWarLocation());
        if (war == null) {
            war = options.getWar();
        }
        if (war == null) {
            throw new IllegalArgumentException("No war or warLocation options set!");
        }
        webapp.setWar(war);
        webapp.setParentLoaderPriority(true);
        webapp.setLogUrlOnStart(true);
        webapp.setInitParameter("scheme", scheme);
        webapp.setExtraClasspath(options.getExtraClassPath());

        // lets set a temporary directory so jetty doesn't bork if some process zaps /tmp/*
        String homeDir = System.getProperty("user.home", ".") + "/.hawtio";
        String tempDirPath = homeDir + "/tmp";
        File tempDir = new File(tempDirPath);
        tempDir.mkdirs();
        log.info("using temp directory for jetty: " + tempDir.getPath());
        webapp.setTempDirectory(tempDir);

        // check for 3rd party plugins before we add hawtio, so they are initialized before hawtio
        findThirdPartyPlugins(log, handlers, tempDir);

        // add hawtio
        handlers.addHandler(webapp);

        // create server and add the handlers
        if (welcome) {
            System.out.println("Embedded Hawtio: You can use --help to show usage");
            System.out.println(options.usedOptionsSummary());
        }

        System.out.println("About to start Hawtio " + war);
        server.start();

        if (welcome) {
            System.out.println();
            System.out.println("Welcome to Hawtio");
            System.out.println("=====================================================");
            System.out.println();
            System.out.println(scheme + "://localhost:" + options.getPort() + options.getContextPath());
            System.out.println();
        }

        if (join) {
            if (welcome) {
                System.out.println("Joining the Jetty server thread");
            }
            server.join();
        }
    }

    protected void findThirdPartyPlugins(Slf4jLog log, HandlerCollection handlers, File tempDir) {
        File dir = new File(options.getPlugins());
        if (dir.exists() && dir.isDirectory()) {

            log.info("Scanning for 3rd party plugins in directory: " + dir.getName());

            // find any .war files
            File[] wars = dir.listFiles(new FilenameFilter() {
                @Override
                public boolean accept(File dir, String name) {
                    return isWarFileName(name);
                }
            });
            if (wars != null) {
                for (File war : wars) {

                    // custom plugins must not use same context-path as hawtio
                    String contextPath = "/" + war.getName();
                    if (contextPath.endsWith(".war")) {
                        contextPath = contextPath.substring(0, contextPath.length() - 4);
                    }
                    if (contextPath.equals(options.getContextPath())) {
                        throw new IllegalArgumentException("3rd party plugin " + war.getName() + " cannot have same name as Hawtio context path. Rename the plugin file to avoid the clash.");
                    }

                    WebAppContext plugin = new WebAppContext();
                    plugin.setServer(handlers.getServer());
                    plugin.setContextPath(contextPath);
                    plugin.setWar(war.getAbsolutePath());
                    // plugin.setParentLoaderPriority(true);
                    plugin.setLogUrlOnStart(true);

                    // need to have private sub directory for each plugin
                    File pluginTempDir = new File(tempDir, war.getName());
                    pluginTempDir.mkdirs();

                    plugin.setTempDirectory(pluginTempDir);
                    plugin.setThrowUnavailableOnStartupException(true);

                    try {
                        plugin.start();
                        handlers.addHandler(plugin);

                        log.info("Added 3rd party plugin with context-path: " + contextPath);
                        System.out.println("Added 3rd party plugin with context-path: " + contextPath);
                    } catch (Exception e) {
                        log.warn("Failed to add and start 3rd party plugin with context-path: " + contextPath + " due " + e.getMessage(), e);
                    }
                }
            }

        }
    }

    /**
     * Strategy method where we could use some smarts to find the war
     * using known paths or maybe the local maven repository?
     */
    protected String findWar(String... paths) {
        if (paths != null) {
            for (String path : paths) {
                if (path != null) {
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
                            File[] wars = file.listFiles((dir, name) -> isWarFileName(name));
                            if (wars != null && wars.length > 0) {
                                return wars[0].getPath();
                            }
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

    public String getWarLocation() {
        return options.getWarLocation();
    }

    public void setWarLocation(String warLocation) {
        options.setWarLocation(warLocation);
    }

    public String getWar() {
        return options.getWar();
    }

    public void setWar(String war) {
        options.setWar(war);
    }

    public String getContextPath() {
        return options.getContextPath();
    }

    public void setContextPath(String contextPath) {
        options.setContextPath(contextPath);
    }

    public Integer getPort() {
        return options.getPort();
    }

    public void setPort(Integer port) {
        options.setPort(port);
    }

    public String getExtraClassPath() {
        return options.getExtraClassPath();
    }

    public void setExtraClassPath(String extraClassPath) {
        options.setExtraClassPath(extraClassPath);
    }

    public boolean isJoinServerThread() {
        return options.isJointServerThread();
    }

    public void setJoinServerThread(boolean joinServerThread) {
        options.setJointServerThread(joinServerThread);
    }

    public boolean isOpenUrl() {
        return options.isOpenUrl();
    }

    public void setOpenUrl(boolean openUrl) {
        options.setOpenUrl(openUrl);
    }

    public boolean isHelp() {
        return options.isHelp();
    }

    public void showWelcome(boolean welcome) {
        this.welcome = welcome;
    }
}
