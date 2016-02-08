package io.hawt.maven.main;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;

/**
 * Main class to boot up Spring.
 */
public class SpringMain {

    private static final Logger LOG = LoggerFactory.getLogger(SpringMain.class);
    private final List<Option> options = new ArrayList<Option>();
    private final CountDownLatch latch = new CountDownLatch(1);
    private final AtomicBoolean completed = new AtomicBoolean(false);
    private static SpringMain instance;
    private AbstractApplicationContext appContext;
    private String applicationContextUri = "META-INF/spring/*.xml";
    private String fileApplicationContextUri;

    public SpringMain() {
        addOption(new ParameterOption("ac", "applicationContext",
                "Sets the classpath based spring ApplicationContext", "applicationContext") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                setApplicationContextUri(parameter);
            }
        });

        addOption(new ParameterOption("fa", "fileApplicationContext",
                "Sets the filesystem based spring ApplicationContext", "fileApplicationContext") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                setFileApplicationContextUri(parameter);
            }
        });
    }

    public static void main(String[] args) throws Exception {
        SpringMain main = new SpringMain();
        instance = main;
        main.run(args);
    }

    public void run(String[] args) throws Exception {
        parseArguments(args);

        LOG.info("Running Spring application");
        try {
            run();
        } finally {
            LOG.info("Shutdown complete");
        }
    }

    /**
     * Parses the command line arguments.
     */
    protected void parseArguments(String[] arguments) {
        LinkedList<String> args = new LinkedList<String>(Arrays.asList(arguments));

        boolean valid = true;
        while (!args.isEmpty()) {
            String arg = args.removeFirst();

            boolean handled = false;
            for (Option option : options) {
                if (option.processOption(arg, args)) {
                    handled = true;
                    break;
                }
            }
            if (!handled) {
                System.out.println("Unknown option: " + arg);
                System.out.println();
                valid = false;
                break;
            }
        }
        if (!valid) {
            showOptions();
            completed();
        }
    }

    /**
     * Displays the command line options.
     */
    public void showOptions() {
        showOptionsHeader();

        for (Option option : options) {
            System.out.println(option.getInformation());
        }
    }

    /**
     * Displays the header message for the command line options.
     */
    public void showOptionsHeader() {
        System.out.println("hawtio:spring takes the following options");
        System.out.println();
    }

    /**
     * Runs this process with the given arguments, and will wait until completed, or the JVM terminates.
     */
    public void run() throws Exception {
        if (!completed.get()) {
            // if we have an issue starting then propagate the exception to caller
            start();
            waitUntilCompleted();
            stop();
        }
    }

    protected void waitUntilCompleted() {
        while (!completed.get()) {
            try {
                latch.await();
            } catch (InterruptedException e) {
                latch.countDown();
                Thread.currentThread().interrupt();
            }
        }
    }

    public void completed() {
        completed.set(true);
        latch.countDown();
    }

    public void start() throws Exception {
        // enable jvm hangup
        HangupInterceptor interceptor = new HangupInterceptor(this);
        Runtime.getRuntime().addShutdownHook(interceptor);

        LOG.info("Starting Spring application context");
        appContext = createApplicationContext();
        appContext.registerShutdownHook();
        appContext.start();
    }

    public void stop() throws Exception {
        LOG.info("Stopping Spring application context");
        appContext.stop();
        appContext.close();
    }

    public void addOption(Option option) {
        options.add(option);
    }

    public String getApplicationContextUri() {
        return applicationContextUri;
    }

    public void setApplicationContextUri(String applicationContextUri) {
        this.applicationContextUri = applicationContextUri;
    }

    public String getFileApplicationContextUri() {
        return fileApplicationContextUri;
    }

    public void setFileApplicationContextUri(String fileApplicationContextUri) {
        this.fileApplicationContextUri = fileApplicationContextUri;
    }

    protected AbstractApplicationContext createApplicationContext() {
        // file based
        if (getFileApplicationContextUri() != null) {
            String[] args = getFileApplicationContextUri().split(";");
            return new FileSystemXmlApplicationContext(args);
        } else {
            // default to classpath based
            String[] args = getApplicationContextUri().split(";");
            return new ClassPathXmlApplicationContext(args);
        }
    }

    /**
     * A class for intercepting the hang up signal and do a graceful shutdown of the Camel.
     */
    private static final class HangupInterceptor extends Thread {
        Logger log = LoggerFactory.getLogger(this.getClass());
        SpringMain mainInstance;

        public HangupInterceptor(SpringMain main) {
            mainInstance = main;
        }

        @Override
        public void run() {
            log.info("Received hang up - stopping the main instance.");
            try {
                mainInstance.completed();
            } catch (Exception ex) {
                log.warn("Error during stopping the main instance.", ex);
            }
        }
    }

    public abstract class Option {
        private String abbreviation;
        private String fullName;
        private String description;

        protected Option(String abbreviation, String fullName, String description) {
            this.abbreviation = "-" + abbreviation;
            this.fullName = "-" + fullName;
            this.description = description;
        }

        public boolean processOption(String arg, LinkedList<String> remainingArgs) {
            if (arg.equalsIgnoreCase(abbreviation) || fullName.startsWith(arg)) {
                doProcess(arg, remainingArgs);
                return true;
            }
            return false;
        }

        public String getAbbreviation() {
            return abbreviation;
        }

        public String getDescription() {
            return description;
        }

        public String getFullName() {
            return fullName;
        }

        public String getInformation() {
            return "  " + getAbbreviation() + " or " + getFullName() + " = " + getDescription();
        }

        protected abstract void doProcess(String arg, LinkedList<String> remainingArgs);
    }

    public abstract class ParameterOption extends Option {
        private String parameterName;

        protected ParameterOption(String abbreviation, String fullName, String description, String parameterName) {
            super(abbreviation, fullName, description);
            this.parameterName = parameterName;
        }

        protected void doProcess(String arg, LinkedList<String> remainingArgs) {
            String parameter = remainingArgs.removeFirst();
            doProcess(arg, parameter, remainingArgs);
        }

        public String getInformation() {
            return "  " + getAbbreviation() + " or " + getFullName() + " <" + parameterName + "> = " + getDescription();
        }

        protected abstract void doProcess(String arg, String parameter, LinkedList<String> remainingArgs);
    }

}
