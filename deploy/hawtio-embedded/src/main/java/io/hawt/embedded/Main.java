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
package io.hawt.embedded;

import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.URI;
import java.util.Arrays;
import java.util.concurrent.Callable;

import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.SslConnectionFactory;
import org.eclipse.jetty.server.handler.HandlerCollection;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.eclipse.jetty.webapp.WebAppContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import picocli.CommandLine;

/**
 * A simple way to run hawtio embedded inside a JVM by booting up a Jetty server
 */
@CommandLine.Command(versionProvider = Main.ManifestVersionProvider.class,
    name = "hawtio", description = "Run Hawtio")
public class Main implements Callable<Integer>  {
    private static Logger log = LoggerFactory.getLogger(Main.class);
    private static CommandLine commandLine;

    @CommandLine.Option(names = {"--war-location", "--l"},
        description = "Directory to search for .war files.")
    String warLocation;
    @CommandLine.Option(names = {"--war", "--w"},
        description = "War file or directory of the hawtio web application.")
    String war;
    @CommandLine.Option(names = {"--context-path", "--c"},
        description = "Context path.",
        defaultValue = "/hawtio")
    String contextPath = "/hawtio";
    @CommandLine.Option(names = {"--plugins-dir", "--pd"},
        description = "Directory to search for .war files to install as 3rd party plugins.",
        defaultValue = "plugins")
    String plugins = "plugins";
    @CommandLine.Option(names = {"--host", "--hst"},
        description = "Hostname to listen to.",
        defaultValue = "0.0.0.0")
    String host = "0.0.0.0";
    @CommandLine.Option(names = {"--port", "--p"},
        description = "Port number.",
        defaultValue = "8080")
    Integer port = 8080;
    @CommandLine.Option(names = {"--extra-class-path", "--ecp"},
        description = "Extra class path.")
    String extraClassPath;
    @CommandLine.Option(names = {"--join", "--j"},
        description = "Join server thread.",
        defaultValue = "true")
    boolean jointServerThread;
    @CommandLine.Option(names = {"--open-url", "--ou"},
        description = "Open the web console automatic in the web browser.",
        defaultValue = "true")
    boolean openUrl;
    @CommandLine.Option(names = {"--key-store", "--ks"},
        description = "JKS keyStore with the keys for https.")
    String keyStore;
    @CommandLine.Option(names = {"--key-store-pass", "--kp"},
        description = "Password for the JKS keyStore with the keys for https.")
    String keyStorePass;
    @CommandLine.Option(names = {"-V", "--version"}, versionHelp = true, description = "Print Hawtio version")
    boolean versionRequested;
    @CommandLine.Option(names = {"-h", "--help"}, usageHelp = true,
        description = "Print usage help and exit.")
    boolean usageHelpRequested;
    private boolean welcome = true;

    public Main() {
    }

    public static void run(String... args) {
        Main main = new Main();
        commandLine = new CommandLine(main);

        int exitCode = commandLine.execute(args);
        System.exit(exitCode);
    }

    @Override
    public Integer call() throws Exception {
        Object val = System.getProperty("hawtio.authenticationEnabled");
        if (val == null) {
            System.setProperty("hawtio.authenticationEnabled", "false");
        }

        if (war == null && warLocation == null) {
            HawtioDefaultLocator.setWar(this);
        }

        this.run();

        return 0;
    }

    public static void main(String[] args) {
        Main main = new Main();

        doRun(main);
    }

    public static void doRun(Main main) {
        try {
            main.run();
        } catch (Exception e) {
            System.out.println("Error: " + e);
            e.printStackTrace();
        }
    }

    public String run() throws Exception {
        return run(jointServerThread);
    }

    public String run(boolean join) throws Exception {
        Server server = new Server(new InetSocketAddress(InetAddress.getByName(host), port));

        HandlerCollection handlers = new HandlerCollection();
        handlers.setServer(server);
        server.setHandler(handlers);

        String scheme = resolveScheme(server);
        WebAppContext webapp = createHawtioWebapp(server, scheme);

        // let's set a temporary directory so jetty doesn't bork if some process zaps /tmp/*
        String homeDir = System.getProperty("user.home", ".") + "/.hawtio";
        String tempDirPath = homeDir + "/tmp";
        File tempDir = new File(tempDirPath);
        tempDir.mkdirs();
        log.info("Using temp directory for jetty: {}", tempDir.getPath());
        webapp.setTempDirectory(tempDir);

        // check for 3rd party plugins before we add hawtio, so they are initialized before hawtio
        findThirdPartyPlugins(log, handlers, tempDir);

        // add hawtio
        handlers.addHandler(webapp);

        // create server and add the handlers
        if (welcome) {
            System.out.println("Embedded Hawtio: You can use --help to show usage");
        }

        System.out.println("About to start Hawtio " + webapp.getWar());
        server.start();

        String url = String.format("%s://%s:%s%s", scheme, host, port, contextPath);
        if (welcome) {
            System.out.println();
            System.out.println("Welcome to Hawtio");
            System.out.println("=====================================================");
            System.out.println();
            System.out.println(url);
            System.out.println();
        }

        if (openUrl && Desktop.isDesktopSupported()) {
            try {
                Desktop.getDesktop().browse(new URI(url));
            } catch (Exception e) {
                System.err.printf(
                    "Failed to open browser session, to access hawtio visit \"%s\"%n",
                    url);
            }
        }

        if (join) {
            if (welcome) {
                System.out.println("Joining the Jetty server thread");
            }
            server.join();
        }

        return url;
    }

    static class ManifestVersionProvider implements CommandLine.IVersionProvider {

        @Override
        public String[] getVersion() throws Exception {
            String[] result = new String[1];
            result[0] = Main.class.getPackage().getImplementationVersion();
            return result;
        }
    }

    private WebAppContext createHawtioWebapp(Server server, String scheme) throws IOException {
        WebAppContext webapp = new WebAppContext();
        webapp.setServer(server);
        webapp.setContextPath(contextPath);
        String foundWar = findWar(warLocation);
        if (foundWar == null) {
            foundWar = war;
        }
        if (foundWar == null) {
            throw new IllegalArgumentException("No war or warLocation options set!");
        }
        webapp.setWar(foundWar);
        webapp.setParentLoaderPriority(true);
        webapp.setLogUrlOnStart(true);
        webapp.setInitParameter("scheme", scheme);
        webapp.setExtraClasspath(extraClassPath);
        return webapp;
    }

    private String resolveScheme(Server server) {
        String scheme = "http";
        if (null != keyStore) {
            System.out.println("Configuring SSL");
            SslContextFactory.Server sslcontf = new SslContextFactory.Server();
            HttpConfiguration httpconf = new HttpConfiguration();
            sslcontf.setKeyStorePath(keyStore);
            if (null != keyStorePass) {
                sslcontf.setKeyStorePassword(keyStorePass);
            } else {
                System.out.println("Attempting to open keystore with no password...");
            }
            try (ServerConnector sslconn = new ServerConnector(server, new SslConnectionFactory(sslcontf, "http/1.1"), new HttpConnectionFactory(httpconf))) {
                sslconn.setPort(port);
                server.setConnectors(new Connector[]{sslconn});

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
        return scheme;
    }

    protected void findThirdPartyPlugins(Logger log, HandlerCollection handlers, File tempDir) {
        File dir = new File(plugins);
        if (!dir.exists() || !dir.isDirectory()) {
            return;
        }

        log.info("Scanning for 3rd party plugins in directory: {}", dir.getPath());

        // find any .war files
        File[] wars = dir.listFiles((d, name) -> isWarFileName(name));
        if (wars == null) {
            return;
        }
        Arrays.stream(wars).forEach(
            war -> deployPlugin(war, log, handlers, tempDir));
    }

    private void deployPlugin(File war, Logger log, HandlerCollection handlers, File tempDir) {
        String contextPath = resolveContextPath(war);

        WebAppContext plugin = new WebAppContext();
        plugin.setServer(handlers.getServer());
        plugin.setContextPath(contextPath);
        plugin.setWar(war.getAbsolutePath());
        // plugin.setParentLoaderPriority(true);
        plugin.setLogUrlOnStart(true);

        // need to have private subdirectory for each plugin
        File pluginTempDir = new File(tempDir, war.getName());
        pluginTempDir.mkdirs();

        plugin.setTempDirectory(pluginTempDir);
        plugin.setThrowUnavailableOnStartupException(true);

        handlers.addHandler(plugin);
        log.info("Added 3rd party plugin with context-path: {}", contextPath);
        System.out.println("Added 3rd party plugin with context-path: " + contextPath);
    }

    private String resolveContextPath(File war) {
        String contextPath = "/" + war.getName();
        if (contextPath.endsWith(".war")) {
            contextPath = contextPath.substring(0, contextPath.length() - 4);
        }
        // custom plugins must not use same context-path as Hawtio
        if (contextPath.equals(this.contextPath)) {
            throw new IllegalArgumentException("3rd party plugin " + war.getName() + " cannot have same name as Hawtio context path. Rename the plugin file to avoid the clash.");
        }
        return contextPath;
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
                            // let's look for a war in this directory
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

    public void showWelcome(boolean welcome) {
        this.welcome = welcome;
    }

    public void setWarLocation(String warLocation) {
        this.warLocation = warLocation;
    }

    public void setWar(String war) {
        this.war = war;
    }

    public void setContextPath(String contextPath) {
        this.contextPath = contextPath;
    }

    public void setPlugins(String plugins) {
        this.plugins = plugins;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public void setExtraClassPath(String extraClassPath) {
        this.extraClassPath = extraClassPath;
    }

    public void setJointServerThread(boolean jointServerThread) {
        this.jointServerThread = jointServerThread;
    }

    public void setOpenUrl(boolean openUrl) {
        this.openUrl = openUrl;
    }

    public void setKeyStore(String keyStore) {
        this.keyStore = keyStore;
    }

    public void setKeyStorePass(String keyStorePass) {
        this.keyStorePass = keyStorePass;
    }
}
