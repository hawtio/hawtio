package io.hawt.maven;

import java.awt.*;
import java.lang.reflect.Method;
import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;

import io.hawt.maven.util.IsolatedThreadGroup;
import org.apache.maven.artifact.Artifact;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugins.annotations.Parameter;

public abstract class BaseRunMojo extends BaseMojo {

    @Parameter(property = "hawtio.context", defaultValue = "hawtio")
    String context;

    @Parameter(property = "hawtio.openWebConsole", defaultValue = "true")
    boolean openWebConsole;

    @Parameter(property = "hawtio.openWebConsoleDelay", defaultValue = "3")
    int openWebConsoleDelay;

    @Parameter(property = "hawtio.mainClass")
    String mainClass;

    @Parameter(property = "hawtio.arguments")
    String[] arguments;

    @Parameter(property = "hawtio.systemProperties")
    Map<String, String> systemProperties;

    boolean bootstrapMain = true;

    ClassLoader classLoader;

    @Override
    protected MojoLifecycle createMojoLifecycle() {
        return new DefaultMojoLifecycle(getLog());
    }

    @Override
    public void execute() throws MojoExecutionException, MojoFailureException {
        // use hawtio-app
        extendedPluginDependencyArtifactId = "hawtio-app";

        try {
            doPrepareArguments();
            doBeforeExecute();
            doExecute();
        } catch (Exception e) {
            throw new MojoExecutionException("Error executing", e);
        }
    }

    protected void doPrepareArguments() throws Exception {
        List<String> args = new ArrayList<String>();

        addCustomArguments(args);

        if (arguments != null) {
            args.addAll(Arrays.asList(arguments));
        }

        arguments = new String[args.size()];
        args.toArray(arguments);

        if (getLog().isDebugEnabled()) {
            StringBuilder msg = new StringBuilder("Invoking: ");
            msg.append(mainClass);
            msg.append(".main(");
            for (int i = 0; i < arguments.length; i++) {
                if (i > 0) {
                    msg.append(", ");
                }
                msg.append(arguments[i]);
            }
            msg.append(")");
            getLog().debug(msg);
        }
    }

    /**
     * To add any custom arguments
     *
     * @param args the arguments
     */
    protected void addCustomArguments(List<String> args) throws Exception {
        // noop
    }

    protected void doExecute() throws Exception {
        if (mainClass == null) {
            throw new IllegalArgumentException("Option mainClass must be specified");
        }

        if (systemProperties != null && !systemProperties.isEmpty()) {
            for (Map.Entry<String, String> entry : systemProperties.entrySet()) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
            getLog().info("Adding system properties: " + systemProperties);
        }

        final IsolatedThreadGroup threadGroup = new IsolatedThreadGroup(this, mainClass);
        final Thread bootstrapThread = new Thread(threadGroup, new Runnable() {
            public void run() {
                try {
                    beforeBootstrapHawtio();

                    getLog().info("Starting hawtio ...");
                    getLog().info("*************************************");
                    Method hawtioMain = Thread.currentThread().getContextClassLoader().loadClass("io.hawt.app.App")
                            .getMethod("main", String[].class);
                    String[] args = new String[]{"--context", context, "--port", "" + getPort()};

                    // do not open the url right now as we need to start Camel a bit first
                    System.setProperty("hawtio.openUrl", "false");
                    hawtioMain.invoke(null, new Object[]{args});

                    afterBootstrapHawtio();

                    beforeBootstrapMain();

                    // setup a background task that opens the url in 5 seconds
                    if (openWebConsole) {
                        Thread thread = new Thread(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    getLog().info("Waiting " + openWebConsoleDelay + " seconds to open the hawtio web console ...");
                                    Thread.sleep(openWebConsoleDelay * 1000);

                                    String url = System.getProperty("hawtio.url");
                                    if (url != null && Desktop.isDesktopSupported()) {
                                        try {
                                            getLog().info("Opening hawtio web console: " + url);
                                            Desktop.getDesktop().browse(new URI(url));
                                        } catch (Exception e) {
                                            System.out.println("Failed to open browser session, to access hawtio visit \"" + url + "\"");
                                        }
                                    }
                                } catch (Throwable e) {
                                    // ignore
                                }
                            }
                        });
                        thread.start();
                    }

                    if (bootstrapMain) {
                        getLog().info("Starting " + mainClass + "...");
                        getLog().info("*************************************");
                        Method main = Thread.currentThread().getContextClassLoader().loadClass(mainClass)
                                .getMethod("main", String[].class);
                        main.invoke(main, new Object[] {arguments});
                    }

                    afterBootstrapMain();

                } catch (Exception e) { // just pass it on
                    // let it be printed so end users can see the exception on the console
                    getLog().error("*************************************");
                    getLog().error("Error occurred while running main from: " + mainClass);
                    getLog().error(e);
                    getLog().error("*************************************");
                    Thread.currentThread().getThreadGroup().uncaughtException(Thread.currentThread(), e);
                }

                // notify before we die
                getLog().info("Terminating thread " + Thread.currentThread());
            }
        }, mainClass + ".main()");

        // resolve artifacts to be used
        Set<Artifact> artifacts = resolveArtifacts();
        resolvedArtifacts(artifacts);

        classLoader = getClassLoader(artifacts);
        bootstrapThread.setContextClassLoader(classLoader);

        bootstrapThread.start();
        mojoLifecycle.join(threadGroup);

        try {
            getLog().info("We will now terminate thread group " + threadGroup);
            mojoLifecycle.terminateThreads(threadGroup);
            threadGroup.destroy();
        } catch (IllegalThreadStateException e) {
            getLog().warn("Cannot destroy thread group " + threadGroup, e);
        }

        if (threadGroup.getUncaughtException() != null) {
            throw new MojoExecutionException("Uncaught exception", threadGroup.getUncaughtException());
        }
    }

    abstract int getPort();

    protected void beforeBootstrapMain() throws Exception {
        // noop
    }

    protected void afterBootstrapMain() throws Exception {
        // noop
    }

    protected void beforeBootstrapHawtio() throws Exception {
        // noop
    }

    protected void afterBootstrapHawtio() throws Exception {
        // noop
    }

}
