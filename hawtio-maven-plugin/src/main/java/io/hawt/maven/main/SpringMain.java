package io.hawt.maven.main;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * Main class to bootup Spring.
 */
public class SpringMain {

    private static final Logger LOG = LoggerFactory.getLogger(SpringMain.class);
    private final CountDownLatch latch = new CountDownLatch(1);
    private final AtomicBoolean completed = new AtomicBoolean(false);
    private static SpringMain instance;
    private AbstractApplicationContext appContext;
    private String ac;
    private String fc;

    public static void main(String[] args) throws Exception {
        SpringMain main = new SpringMain();
        instance = main;
        main.run(args);
    }

    public void run(String[] args) throws Exception {
        // TODO: parse args
        appContext = new ClassPathXmlApplicationContext("META-INF/spring/camel-context.xml");

        // enable jvm hangup
        HangupInterceptor interceptor = new HangupInterceptor(this);
        Runtime.getRuntime().addShutdownHook(interceptor);

        LOG.info("Running Spring application");
        try {
            run();
        } finally {
            LOG.info("Shutdown complete");
        }
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
        LOG.info("Starting Spring application context");
        appContext.start();
    }

    public void stop() throws Exception {
        LOG.info("Stopping Spring application context");
        appContext.stop();
        appContext.close();
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

}
