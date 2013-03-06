package io.hawt.karaf.itest;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.FutureTask;
import java.util.concurrent.TimeUnit;
import javax.inject.Inject;

import org.apache.felix.service.command.CommandProcessor;
import org.apache.felix.service.command.CommandSession;
import org.junit.After;
import org.junit.Before;
import org.openengsb.labs.paxexam.karaf.options.KarafDistributionOption;
import org.ops4j.pax.exam.Option;
import org.ops4j.pax.exam.TestProbeBuilder;
import org.ops4j.pax.exam.junit.Configuration;
import org.ops4j.pax.exam.junit.ProbeBuilder;
import org.ops4j.pax.exam.options.UrlReference;
import org.osgi.framework.BundleContext;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.openengsb.labs.paxexam.karaf.options.KarafDistributionOption.karafDistributionConfiguration;
import static org.openengsb.labs.paxexam.karaf.options.KarafDistributionOption.replaceConfigurationFile;
import static org.ops4j.pax.exam.CoreOptions.maven;
import static org.ops4j.pax.exam.CoreOptions.mavenBundle;
import static org.ops4j.pax.exam.CoreOptions.scanFeatures;

public abstract class AbstractFeatureTest {

    private static final Logger LOG = LoggerFactory.getLogger(AbstractFeatureTest.class);
    private static final long ASSERTION_TIMEOUT = 20000L;
    private static final long COMMAND_TIMEOUT = 10000L;
    public static final String USER = "karaf";
    public static final String PASSWORD = "karaf";

    static String basedir;
    static {
        try {
            File location = new File(AbstractFeatureTest.class.getProtectionDomain().getCodeSource().getLocation().getFile());
            basedir = new File(location, "../..").getCanonicalPath();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Inject
    protected BundleContext bundleContext;

    @Before
    public void setUp() throws Exception {
    }

    @After
    public void tearDown() throws Exception {
    }


    @ProbeBuilder
    public TestProbeBuilder probeConfiguration(TestProbeBuilder probe) {
        probe.setHeader(Constants.DYNAMICIMPORT_PACKAGE, "*,org.ops4j.pax.exam.options.*,org.apache.felix.service.*;status=provisional");
        return probe;
    }

    @Inject
    CommandProcessor commandProcessor;
    ExecutorService executor = Executors.newCachedThreadPool();

    protected String executeCommand(final String command, final Long timeout, final Boolean silent) {
            String response;
            final ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            final PrintStream printStream = new PrintStream(byteArrayOutputStream);
            final CommandSession commandSession = commandProcessor.createSession(System.in, printStream, printStream);
            commandSession.put("APPLICATION", System.getProperty("karaf.name", "root"));
            commandSession.put("USER", USER);
            FutureTask<String> commandFuture = new FutureTask<String>(
                    new Callable<String>() {
                        public String call() {
                            try {
                                if (!silent) {
                                    System.out.println(command);
                                    System.out.flush();
                                }
                                commandSession.execute(command);
                            } catch (Exception e) {
                                e.printStackTrace(System.err);
                            }
                            printStream.flush();
                            return byteArrayOutputStream.toString();
                        }
                    });

            try {
                executor.submit(commandFuture);
                response = commandFuture.get(timeout, TimeUnit.MILLISECONDS);
            } catch (Exception e) {
                e.printStackTrace(System.err);
                response = "SHELL COMMAND TIMED OUT: ";
            }

            return response;
        }

    protected String executeCommand(final String command) {
        return executeCommand(command, COMMAND_TIMEOUT, false);
    }


    public static String karafVersion() {
        return System.getProperty("karafVersion", "2.3.1");
    }

    public static UrlReference getHawtIOFeatureUrl() {
        String type = "xml/features";
        return mavenBundle().groupId("io.hawt").
            artifactId("hawtio-karaf").versionAsInProject().type(type);
    }
    
    public static UrlReference getKarafFeatureUrl() {
        LOG.info("*** The karaf version is " + karafVersion() + " ***");

        String type = "xml/features";
        return mavenBundle().groupId("org.apache.karaf.assemblies.features").
            artifactId("standard").version(karafVersion()).type(type);
    }

    public static Option[] append(Option toAdd, Option[] existingOptions) {
        ArrayList<Option> newOptions = new ArrayList<Option>();
        newOptions.addAll(Arrays.asList(existingOptions));
        newOptions.add(toAdd);
        return newOptions.toArray(new Option[]{});
    }

    @Configuration
    public static Option[] configure() {
        Option[] options =
            new Option[]{
                karafDistributionConfiguration().frameworkUrl(
                    maven().groupId("org.apache.karaf").artifactId("apache-karaf").type("tar.gz").version(karafVersion()))
                    //This version doesn't affect the version of karaf we use 
                    .karafVersion(karafVersion()).name("Apache Karaf")
                    .unpackDirectory(new File("target/paxexam/unpack/")),
                
                KarafDistributionOption.keepRuntimeFolder(),
                // override the config.properties (to fix pax-exam bug)
                replaceConfigurationFile("etc/config.properties", new File(basedir+"/src/test/resources/config.properties")),
                replaceConfigurationFile("etc/custom.properties", new File(basedir+"/src/test/resources/custom.properties")),
                scanFeatures(getHawtIOFeatureUrl(), "hawtio")};

        return options;
    }

    protected boolean withinReason(Callable<Boolean> callable) throws Exception {
        long max = System.currentTimeMillis() + ASSERTION_TIMEOUT;
        while (true) {
            try {
                return callable.call();
            } catch (Exception t) {
                if (System.currentTimeMillis() < max) {
                    TimeUnit.SECONDS.sleep(1);
                    continue;
                } else {
                    throw t;
                }
            }
        }
    }
}
