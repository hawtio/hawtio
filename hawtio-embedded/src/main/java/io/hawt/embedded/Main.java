package io.hawt.embedded;

import java.io.File;
import java.io.FilenameFilter;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Slf4jLog;
import org.eclipse.jetty.webapp.WebAppContext;

/**
 * A simple way to run hawtio embedded inside a JVM by booting up a Jetty server
 */
public class Main {
    private Options options;
    private final boolean joinServerThread = true;
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
        run(joinServerThread);

    }
    public void run(boolean join) throws Exception {
        System.setProperty("org.eclipse.jetty.util.log.class", Slf4jLog.class.getName());
        Slf4jLog log = new Slf4jLog("jetty");
        Log.setLog(log);

        WebAppContext webapp = new WebAppContext();
        webapp.setContextPath(options.getContextPath());

        String war = findWar(options.getWarLocation());
        if (war == null) {
            war = findWar(options.getWarFileName());
        }
        if (war == null) {
            throw new IllegalArgumentException("No war property set!");
        }
        webapp.setWar(war);
        webapp.setParentLoaderPriority(true);
        webapp.setLogUrlOnStart(true);
        webapp.setExtraClasspath(options.getExtraClassPath());

        Server server = new Server(options.getPort());
        server.setHandler(webapp);

        if (welcome) {
            System.out.println("Embedded hawtio: You can use --help to show usage");
            System.out.println(options.usedOptionsSummary());
        }

        System.out.println("About to start war " + war);
        server.start();

        if (welcome) {
            System.out.println();
            System.out.println("hawtio: Don't cha wish your console was hawt like me!");
            System.out.println("=====================================================");
            System.out.println();
            System.out.println("http://localhost:" + options.getPort() + options.getContextPath());
            System.out.println();
        }

        if (join) {
            if (welcome) {
                System.out.println("Joining the Jetty server thread");
            }
            server.join();
        }
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

    public String getWarFileName() {
        return options.getWarFileName();
    }

    public void setWarFileName(String warFileName) {
        options.setWarFileName(warFileName);
    }

    public String getWarLocation() {
        return options.getWarLocation();
    }

    public void setWarLocation(String warLocation) {
        options.setWarLocation(warLocation);
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

    public boolean isHelp() {
        return options.isHelp();
    }

    public void showWelcome(boolean welcome) {
        this.welcome = welcome;
    }
}
