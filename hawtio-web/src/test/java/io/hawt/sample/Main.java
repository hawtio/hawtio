package io.hawt.sample;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import io.hawt.sample.infinispan.InfinispanDemo;
import org.apache.camel.CamelException;
import org.eclipse.jetty.jmx.MBeanContainer;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Slf4jLog;
import org.eclipse.jetty.webapp.Configuration;
import org.eclipse.jetty.webapp.WebInfConfiguration;
import org.eclipse.jetty.webapp.WebXmlConfiguration;
import org.fusesource.fabric.service.FabricServiceImpl;
import org.fusesource.fabric.zookeeper.IZKClient;
import org.fusesource.fabric.zookeeper.spring.ZKClientFactoryBean;
import org.mortbay.jetty.plugin.JettyWebAppContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import javax.management.MBeanServer;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

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
            String contextPath = System.getProperty("context", "/sample");
            String path = System.getProperty("webapp-outdir", "src/main/webapp");
            String webXml = path + "/WEB-INF/web.xml";
            require(fileExists(webXml), "No web.xml could be found for $webXml");

            println("Connect via http://localhost:" + port + contextPath + " using web app source path: " + path);

            String pathSeparator = File.pathSeparator;

            String classpath = System.getProperty("java.class.path", "");
            ImmutableList<String> classpaths = ImmutableList.copyOf(classpath.split(pathSeparator));

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
            context.setResourceBase(path);
            context.setContextPath(contextPath);
            context.setParentLoaderPriority(true);

            Server server = new Server(port);
            server.setHandler(context);

            // enable JMX
            MBeanServer mbeanServer = ManagementFactory.getPlatformMBeanServer();
            MBeanContainer mbeanContainer = new MBeanContainer(mbeanServer);
            if (server.getContainer() != null) {
                server.getContainer().addEventListener(mbeanContainer);
            }
            server.addBean(mbeanContainer);

            if (args.length == 0 || !args[0].equals("nospring")) {
                // now lets startup a spring application context
                LOG.info("starting spring application context");
                ClassPathXmlApplicationContext appContext = new ClassPathXmlApplicationContext("applicationContext.xml");
                Object activemq = appContext.getBean("activemq");
                LOG.info("created activemq: " + activemq);
                appContext.start();

                Object logQuery = appContext.getBean("logQuery");
                LOG.info("created logQuery: " + logQuery);

                LOG.warn("Don't run with scissors!");
                LOG.error("Someone somewhere is not using Fuse! :)", new CamelException("My exception message"));
            }

            // TODO temporary hack until we've got blueprint servlet listener to load blueprint services
            try {
                Class<?> aetherClass = Class.forName("org.fusesource.insight.maven.aether.AetherFacade");
                Object aether = aetherClass.newInstance();
                Method initMethod = aetherClass.getMethod("init");
                Object[] methodArgs = new Object[0];
                initMethod.invoke(aether, methodArgs);
            } catch (InvocationTargetException e) {
                Throwable target = e.getTargetException();
                LOG.warn("Failed to initialise AetherFacade due to : " + e, e);
            } catch (Throwable e) {
                LOG.warn("Could not load the AetherFacade; only available in snapshots for now: " + e, e);
            }

            // lets connect to fabric
            String fabricUrl = System.getProperty("fabricUrl", "");
            String fabricPassword = System.getProperty("fabricPassword", "admin");

            if (fabricUrl != null && fabricUrl.length() > 0) {
                LOG.info("Connecting to Fuse Fabric at " + fabricUrl);
                ZKClientFactoryBean factory = new ZKClientFactoryBean();
                factory.setPassword(fabricPassword);
                factory.setConnectString(fabricUrl);
                IZKClient zooKeeper = factory.getObject();
                FabricServiceImpl impl = new FabricServiceImpl();
                impl.setMbeanServer(mbeanServer);
                impl.setZooKeeper(zooKeeper);
                impl.init();
            }

            // lets initialise infinispan
            new InfinispanDemo().run();

            LOG.info("starting jetty");
            server.start();

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
