package io.hawt.sample;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import org.apache.aries.blueprint.container.BlueprintContainerImpl;
import org.apache.camel.CamelException;
import org.apache.camel.util.CamelContextHelper;
import org.eclipse.jetty.jmx.MBeanContainer;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Slf4jLog;
import org.eclipse.jetty.webapp.Configuration;
import org.eclipse.jetty.webapp.WebInfConfiguration;
import org.eclipse.jetty.webapp.WebXmlConfiguration;
import org.mortbay.jetty.plugin.JettyWebAppContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import javax.management.MBeanServer;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A simple bootstrap class
 */
public class Main {
    private static final transient Logger LOG = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        try {
            System.setProperty("org.eclipse.jetty.util.log.class", Slf4jLog.class.getName());
            Log.setLog(new Slf4jLog("jetty"));
            int port = Integer.parseInt(System.getProperty("jettyPort", "8080"));
            String contextPath = System.getProperty("context", "/hawtio");
            if (!contextPath.startsWith("/")) {
                contextPath = "/" + contextPath;
            }
            String sourcePath = "src/main/webapp";
            String webappOutdir = System.getProperty("webapp-outdir", "target/hawtio-web-1.3-SNAPSHOT");
            String webXml = sourcePath + "/WEB-INF/web.xml";
            require(fileExists(webXml), "No web.xml could be found for $webXml");

            String pathSeparator = File.pathSeparator;

            String classpath = System.getProperty("java.class.path", "");
            ImmutableList<String> classpaths = ImmutableList.copyOf(Arrays.asList(classpath.split(pathSeparator)));

            Iterable<String> jarNames = Iterables.filter(classpaths, new Predicate<String>() {
                public boolean apply(String path) {
                    return isScannedWebInfLib(path);
                }
            });

            Iterable<File> allFiles = Iterables.transform(jarNames, new Function<String, File>() {
                public File apply(String path) {
                    return new File(path);
                }
            });

            Iterable<File> files = Iterables.filter(allFiles, new Predicate<File>() {
                public boolean apply(File file) {
                    return file != null && file.exists();
                }
            });

            Iterable<File> jars = Iterables.filter(files, new Predicate<File>() {
                public boolean apply(File file) {
                    return file.isFile();
                }
            });

            Iterable<File> extraClassDirs = Iterables.filter(files, new Predicate<File>() {
                public boolean apply(File file) {
                    return file.isDirectory();
                }
            });

            JettyWebAppContext context = new JettyWebAppContext();
            context.setWebInfLib(ImmutableList.copyOf(jars));
            Configuration[] contextConfigs = {new WebXmlConfiguration(), new WebInfConfiguration()};
            context.setConfigurations(contextConfigs);
            context.setDescriptor(webXml);
            context.setResourceBases(new String[] {sourcePath, webappOutdir});
            context.setContextPath(contextPath);
            context.setParentLoaderPriority(true);

            // lets try disable the memory mapped file which causes issues
            // on Windows when using mvn -Pwatch
            // see http://docs.codehaus.org/display/JETTY/Files+locked+on+Windows
            // https://github.com/hawtio/hawtio/issues/22
            if (System.getProperty("jettyUseFileLock", "").toLowerCase().equals("false")) {
                LOG.info("Disabling the use of the Jetty file lock for static content to try fix incremental grunt compilation on Windows");
                context.setCopyWebDir(true);
                context.setInitParameter("useFileMappedBuffer", "false");
            }

            Server server = new Server(port);
            server.setHandler(context);

            // enable JMX
            MBeanServer mbeanServer = ManagementFactory.getPlatformMBeanServer();
            MBeanContainer mbeanContainer = new MBeanContainer(mbeanServer);
            if (server.getContainer() != null) {
                server.getContainer().addEventListener(mbeanContainer);
            }
            server.addBean(mbeanContainer);

            // lets initialise blueprint
            List<URL> resourcePaths = new ArrayList<URL>();
            ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
            Enumeration<URL> resources = classLoader.getResources("OSGI-INF/blueprint/blueprint.xml");
            while (resources.hasMoreElements()) {
                URL url = resources.nextElement();
                String text = url.toString();
                if (text.contains("karaf")) {
                    LOG.info("Ignoring karaf based blueprint file " + text);
                } else if (text.contains("hawtio-system")) {
                    LOG.info("Ignoring hawtio-system");
                } else {
                    resourcePaths.add(url);
                }
            }
            LOG.info("Loading Blueprint contexts " + resourcePaths);

            Map<String, String> properties = new HashMap<String, String>();
            BlueprintContainerImpl container = new BlueprintContainerImpl(classLoader, resourcePaths, properties, true);


            if (args.length == 0 || !args[0].equals("nospring")) {
                // now lets startup a spring application context
                LOG.info("starting spring application context");
                ClassPathXmlApplicationContext appContext = new ClassPathXmlApplicationContext("applicationContext.xml");
                Object activemq = appContext.getBean("activemq");
                LOG.info("created activemq: " + activemq);
                appContext.start();

                LOG.warn("Don't run with scissors!");
                LOG.error("Someone somewhere is not using Fuse! :)", new CamelException("My exception message"));

                // now lets force an exception with a stack trace from camel...
                try {
                    CamelContextHelper.getMandatoryEndpoint(null, null);
                } catch (Throwable e) {
                    LOG.error("Expected exception for testing: " + e, e);
                }
            }


            // lets connect to fabric
            println("");
            println("");
            println("OPEN: http://localhost:" + port + contextPath + " using web app source path: " + webappOutdir);
            println("");
            println("");

            LOG.info("starting jetty");
            server.start();

            LOG.info("Joining the jetty server thread...");
            server.join();
        } catch (Throwable e) {
            LOG.error(e.getMessage(), e);
        }
    }

    /**
     * Returns true if the file exists
     */
    public static boolean fileExists(String path) {
        File file = new File(path);
        return file.exists() && file.isFile();
    }

    /**
     * Returns true if the directory exists
     */
    public static boolean directoryExists(String path) {
        File file = new File(path);
        return file.exists() && file.isDirectory();
    }

    public static void require(boolean flag, String message) {
        if (!flag) {
            throw new IllegalStateException(message);
        }
    }

    /**
     * Returns true if we should scan this lib for annotations
     */
    public static boolean isScannedWebInfLib(String path) {
        return path.endsWith("kool/website/target/classes");
        //return path.contains("kool")
        //return true
    }


    public static void println(Object message) {
        System.out.println(message);
    }

}
