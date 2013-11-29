package io.hawt.maven;

import java.io.File;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.apache.maven.artifact.Artifact;
import org.apache.maven.artifact.factory.ArtifactFactory;
import org.apache.maven.artifact.metadata.ArtifactMetadataSource;
import org.apache.maven.artifact.repository.ArtifactRepository;
import org.apache.maven.artifact.resolver.ArtifactResolutionResult;
import org.apache.maven.artifact.resolver.ArtifactResolver;
import org.apache.maven.artifact.resolver.filter.ArtifactFilter;
import org.apache.maven.artifact.resolver.filter.ExcludesArtifactFilter;
import org.apache.maven.artifact.versioning.InvalidVersionSpecificationException;
import org.apache.maven.artifact.versioning.VersionRange;
import org.apache.maven.model.Dependency;
import org.apache.maven.model.Exclusion;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugins.annotations.Component;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;
import org.apache.maven.project.MavenProject;
import org.apache.maven.project.MavenProjectBuilder;
import org.apache.maven.project.artifact.MavenMetadataSource;

@Mojo(name = "run", defaultPhase = LifecyclePhase.TEST_COMPILE, requiresDependencyResolution = ResolutionScope.COMPILE_PLUS_RUNTIME)
public class RunMojo extends AbstractMojo {

    @Component
    private MavenProject project;

    @Component
    private ArtifactResolver artifactResolver;

    @Component
    private ArtifactFactory artifactFactory;

    @Component
    private MavenProjectBuilder projectBuilder;

    @Component
    private ArtifactMetadataSource metadataSource;

    @Parameter(property = "localRepository", readonly = true, required = true)
    private ArtifactRepository localRepository;

    @Parameter(property = "project.remoteArtifactRepositories")
    private List<?> remoteRepositories;

    @Parameter(readonly = true, property = "plugin.artifacts")
    private List<Artifact> pluginDependencies;

    @Parameter(property = "hawtio.port", defaultValue = "8080")
    private int port;

    @Parameter(property = "hawtio.context", defaultValue = "hawtio")
    private String context;

    @Parameter(property = "hawtio.mainClass")
    private String mainClass;

    @Parameter(property = "hawtio.logClasspath", defaultValue = "false")
    private boolean logClasspath;

    @Parameter(property = "hawtio.arguments")
    private String[] arguments;

    private long daemonThreadJoinTimeout = 15000L;

    private boolean includeProjectDependencies = true;
    private String extraPluginDependencyArtifactId;
    private String extendedPluginDependencyArtifactId;

    @Override
    public void execute() throws MojoExecutionException, MojoFailureException {
        getLog().info("hawtio web console at http://localhost:" + port + "/" + context);

        try {
            doPrepareArguments();
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
    protected void addCustomArguments(List<String> args) {
        // noop
    }

    protected void doExecute() throws Exception {
        if (mainClass == null) {
            throw new IllegalArgumentException("Option mainClass must be specified");
        }

        final IsolatedThreadGroup threadGroup = new IsolatedThreadGroup(mainClass /* name */);
        final Thread bootstrapThread = new Thread(threadGroup, new Runnable() {
            public void run() {
                try {
                    beforeBootstrapMain();

                    getLog().info("Starting " + mainClass + "...");
                    Method main = Thread.currentThread().getContextClassLoader().loadClass(mainClass)
                            .getMethod("main", new Class[] {String[].class});
                    if (!main.isAccessible()) {
                        getLog().debug("Setting accessibility to true in order to invoke main().");
                        main.setAccessible(true);
                    }
                    main.invoke(main, new Object[] {arguments});

                    afterBootstrapMain();
                } catch (Exception e) { // just pass it on
                    // let it be printed so end users can see the exception on the console
                    getLog().error("*************************************");
                    getLog().error("Error occurred while running main from: " + mainClass);
                    getLog().error(e);
                    getLog().error("*************************************");
                    Thread.currentThread().getThreadGroup().uncaughtException(Thread.currentThread(), e);
                }
            }
        }, mainClass + ".main()");

        bootstrapThread.setContextClassLoader(getClassLoader());
        // TODO: system properties, and restore original afterwards
        // setSystemProperties();

        bootstrapThread.start();
        joinNonDaemonThreads(threadGroup);

        try {
            terminateThreads(threadGroup);
            threadGroup.destroy();
        } catch (IllegalThreadStateException e) {
            getLog().warn("Cannot destroy thread group " + threadGroup, e);
        }

        synchronized (threadGroup) {
            if (threadGroup.uncaughtException != null) {
                throw new MojoExecutionException(null, threadGroup.uncaughtException);
            }
        }

    }

    protected void beforeBootstrapMain() {
        // noop
    }

    protected void afterBootstrapMain() {
        // noop
    }

    /**
     * Set up a classloader for the execution of the main class.
     *
     * @return the classloader
     * @throws MojoExecutionException
     */
    private ClassLoader getClassLoader() throws MojoExecutionException {
        Set<URL> classpathURLs = new LinkedHashSet<URL>();
        // project classpath must be first
        this.addRelevantProjectDependenciesToClasspath(classpathURLs);
        // and extra plugin classpath
        this.addExtraPluginDependenciesToClasspath(classpathURLs);
        // and plugin classpath last
        this.addRelevantPluginDependenciesToClasspath(classpathURLs);

        if (logClasspath) {
            getLog().info("Classpath:");
            for (URL url : classpathURLs) {
                getLog().info("  " + url.getFile().toString());
            }
        }
        return new URLClassLoader(classpathURLs.toArray(new URL[classpathURLs.size()]));
    }

    /**
     * Add any relevant project dependencies to the classpath. Takes
     * includeProjectDependencies into consideration.
     *
     * @param path classpath of {@link java.net.URL} objects
     * @throws MojoExecutionException
     */
    @SuppressWarnings("unchecked")
    private void addRelevantProjectDependenciesToClasspath(Set<URL> path) throws MojoExecutionException {
        try {
            getLog().debug("Project Dependencies will be included.");

            URL mainClasses = new File(project.getBuild().getOutputDirectory()).toURI().toURL();
            getLog().debug("Adding to classpath : " + mainClasses);
            path.add(mainClasses);

            Set<Artifact> dependencies = project.getArtifacts();
            getLog().info("There are " + dependencies.size() + " dependencies in the project");

            // system scope dependencies are not returned by maven 2.0. See MEXEC-17
            dependencies.addAll(getAllNonTestScopedDependencies());

            Iterator<Artifact> iter = dependencies.iterator();
            while (iter.hasNext()) {
                Artifact classPathElement = iter.next();
                getLog().debug("Adding project dependency artifact: " + classPathElement.getArtifactId()
                        + " to classpath");

                getLog().debug("Artifact: " + classPathElement);
                File file = classPathElement.getFile();
                if (file != null) {
                    path.add(file.toURI().toURL());
                }
            }
        } catch (MalformedURLException e) {
            throw new MojoExecutionException("Error during setting up classpath", e);
        }
    }

    /**
     * Add any relevant project dependencies to the classpath. Indirectly takes
     * includePluginDependencies and ExecutableDependency into consideration.
     *
     * @param path classpath of {@link java.net.URL} objects
     * @throws MojoExecutionException
     */
    private void addExtraPluginDependenciesToClasspath(Set<URL> path) throws MojoExecutionException {
        if (extraPluginDependencyArtifactId == null && extendedPluginDependencyArtifactId == null) {
            return;
        }

        try {
            Set<Artifact> artifacts = new HashSet<Artifact>(this.pluginDependencies);
            for (Artifact artifact : artifacts) {
                // must
                if (artifact.getArtifactId().equals(extraPluginDependencyArtifactId)
                        || artifact.getArtifactId().equals(extendedPluginDependencyArtifactId)) {
                    getLog().debug("Adding extra plugin dependency artifact: " + artifact.getArtifactId()
                            + " to classpath");
                    path.add(artifact.getFile().toURI().toURL());

                    // add the transient dependencies of this artifact
                    Set<Artifact> deps = resolveExecutableDependencies(artifact);
                    for (Artifact dep : deps) {

                        // we must skip org.apache.aries.blueprint.core:, otherwise we get duplicate blueprint extenders
                        if (dep.getArtifactId().equals("org.apache.aries.blueprint.core")) {
                            getLog().debug("Skipping org.apache.aries.blueprint.core -> " + dep.getGroupId() + "/" + dep.getArtifactId() + "/" + dep.getVersion());
                            continue;
                        }

                        getLog().debug("Adding extra plugin dependency artifact: " + dep.getArtifactId()
                                + " to classpath");
                        path.add(dep.getFile().toURI().toURL());
                    }
                }
            }
        } catch (MalformedURLException e) {
            throw new MojoExecutionException("Error during setting up classpath", e);
        }
    }

    /**
     * Add any relevant project dependencies to the classpath. Indirectly takes
     * includePluginDependencies and ExecutableDependency into consideration.
     *
     * @param path classpath of {@link java.net.URL} objects
     * @throws MojoExecutionException
     */
    private void addRelevantPluginDependenciesToClasspath(Set<URL> path) throws MojoExecutionException {
        if (pluginDependencies == null) {
            return;
        }

        try {
            Iterator<Artifact> iter = this.pluginDependencies.iterator();
            while (iter.hasNext()) {
                Artifact classPathElement = iter.next();

                // we must skip org.osgi.core, otherwise we get a
                // java.lang.NoClassDefFoundError: org.osgi.vendor.framework property not set
                if (classPathElement.getArtifactId().equals("org.osgi.core")) {
                    getLog().debug("Skipping org.osgi.core -> " + classPathElement.getGroupId() + "/" + classPathElement.getArtifactId() + "/" + classPathElement.getVersion());
                    continue;
                }

                getLog().debug("Adding plugin dependency artifact: " + classPathElement.getArtifactId()
                        + " to classpath");
                path.add(classPathElement.getFile().toURI().toURL());
            }
        } catch (MalformedURLException e) {
            throw new MojoExecutionException("Error during setting up classpath", e);
        }

    }

    private Collection<Artifact> getAllNonTestScopedDependencies() throws MojoExecutionException {
        List<Artifact> answer = new ArrayList<Artifact>();

        for (Artifact artifact : getAllDependencies()) {

            // do not add test artifacts
            if (!artifact.getScope().equals(Artifact.SCOPE_TEST)) {
                answer.add(artifact);
            }
        }
        return answer;
    }

    // generic method to retrieve all the transitive dependencies
    private Collection<Artifact> getAllDependencies() throws MojoExecutionException {
        List<Artifact> artifacts = new ArrayList<Artifact>();

        for (Iterator<?> dependencies = project.getDependencies().iterator(); dependencies.hasNext();) {
            Dependency dependency = (Dependency)dependencies.next();

            String groupId = dependency.getGroupId();
            String artifactId = dependency.getArtifactId();

            VersionRange versionRange;
            try {
                versionRange = VersionRange.createFromVersionSpec(dependency.getVersion());
            } catch (InvalidVersionSpecificationException e) {
                throw new MojoExecutionException("unable to parse version", e);
            }

            String type = dependency.getType();
            if (type == null) {
                type = "jar";
            }
            String classifier = dependency.getClassifier();
            boolean optional = dependency.isOptional();
            String scope = dependency.getScope();
            if (scope == null) {
                scope = Artifact.SCOPE_COMPILE;
            }

            Artifact art = this.artifactFactory.createDependencyArtifact(groupId, artifactId, versionRange,
                    type, classifier, scope, null, optional);

            if (scope.equalsIgnoreCase(Artifact.SCOPE_SYSTEM)) {
                art.setFile(new File(dependency.getSystemPath()));
            }

            List<String> exclusions = new ArrayList<String>();
            for (Iterator<?> j = dependency.getExclusions().iterator(); j.hasNext();) {
                Exclusion e = (Exclusion)j.next();
                exclusions.add(e.getGroupId() + ":" + e.getArtifactId());
            }

            ArtifactFilter newFilter = new ExcludesArtifactFilter(exclusions);

            art.setDependencyFilter(newFilter);

            artifacts.add(art);
        }

        return artifacts;
    }

    /**
     * Get the artifact which refers to the POM of the executable artifact.
     *
     * @param executableArtifact this artifact refers to the actual assembly.
     * @return an artifact which refers to the POM of the executable artifact.
     */
    private Artifact getExecutablePomArtifact(Artifact executableArtifact) {
        return this.artifactFactory.createBuildArtifact(executableArtifact.getGroupId(), executableArtifact
                .getArtifactId(), executableArtifact.getVersion(), "pom");
    }

    @SuppressWarnings("unchecked")
    private Set<Artifact> resolveExecutableDependencies(Artifact executablePomArtifact) throws MojoExecutionException {

        Set<Artifact> executableDependencies;
        try {
            MavenProject executableProject = this.projectBuilder.buildFromRepository(executablePomArtifact,
                    this.remoteRepositories,
                    this.localRepository);

            // get all of the dependencies for the executable project
            List<Artifact> dependencies = executableProject.getDependencies();

            // make Artifacts of all the dependencies
            Set<Artifact> dependencyArtifacts
                    = MavenMetadataSource.createArtifacts(this.artifactFactory, dependencies,
                    null, null, null);

            // not forgetting the Artifact of the project itself
            dependencyArtifacts.add(executableProject.getArtifact());

            // resolve all dependencies transitively to obtain a comprehensive
            // list of assemblies
            ArtifactResolutionResult result = artifactResolver.resolveTransitively(dependencyArtifacts,
                    executablePomArtifact,
                    Collections.emptyMap(),
                    this.localRepository,
                    this.remoteRepositories,
                    metadataSource, null,
                    Collections.emptyList());
            executableDependencies = result.getArtifacts();

        } catch (Exception ex) {
            throw new MojoExecutionException("Encountered problems resolving dependencies of the executable "
                    + "in preparation for its execution.", ex);
        }

        return executableDependencies;
    }

    private void joinNonDaemonThreads(ThreadGroup threadGroup) {
        boolean foundNonDaemon;
        do {
            foundNonDaemon = false;
            Collection<Thread> threads = getActiveThreads(threadGroup);
            for (Thread thread : threads) {
                if (thread.isDaemon()) {
                    continue;
                }
                foundNonDaemon = true; // try again; maybe more threads were
                // created while we were busy
                joinThread(thread, 0);
            }
        } while (foundNonDaemon);
    }

    private void joinThread(Thread thread, long timeoutMsecs) {
        try {
            getLog().debug("joining on thread " + thread);
            thread.join(timeoutMsecs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt(); // good practice if don't throw
            getLog().warn("interrupted while joining against thread " + thread, e); // not
            // expected!
        }
        // generally abnormal
        if (thread.isAlive()) {
            getLog().warn("thread " + thread + " was interrupted but is still alive after waiting at least "
                    + timeoutMsecs + "msecs");
        }
    }

    private Collection<Thread> getActiveThreads(ThreadGroup threadGroup) {
        Thread[] threads = new Thread[threadGroup.activeCount()];
        int numThreads = threadGroup.enumerate(threads);
        Collection<Thread> result = new ArrayList<Thread>(numThreads);
        for (int i = 0; i < threads.length && threads[i] != null; i++) {
            result.add(threads[i]);
        }
        // note: result should be modifiable
        return result;
    }

    @SuppressWarnings("deprecation")
    private void terminateThreads(ThreadGroup threadGroup) {
        long startTime = System.currentTimeMillis();
        Set<Thread> uncooperativeThreads = new HashSet<Thread>(); // these were not responsive
        // to interruption
        for (Collection<Thread> threads = getActiveThreads(threadGroup); !threads.isEmpty(); threads = getActiveThreads(threadGroup), threads
                .removeAll(uncooperativeThreads)) {
            // Interrupt all threads we know about as of this instant (harmless
            // if spuriously went dead (! isAlive())
            // or if something else interrupted it ( isInterrupted() ).
            for (Thread thread : threads) {
                getLog().debug("interrupting thread " + thread);
                thread.interrupt();
            }
            // Now join with a timeout and call stop() (assuming flags are set
            // right)
            for (Thread thread : threads) {
                if (!thread.isAlive()) {
                    continue; // and, presumably it won't show up in
                    // getActiveThreads() next iteration
                }
                if (daemonThreadJoinTimeout <= 0) {
                    joinThread(thread, 0); // waits until not alive; no timeout
                    continue;
                }
                long timeout = daemonThreadJoinTimeout - (System.currentTimeMillis() - startTime);
                if (timeout > 0) {
                    joinThread(thread, timeout);
                }
                if (!thread.isAlive()) {
                    continue;
                }
                uncooperativeThreads.add(thread); // ensure we don't process
                getLog().warn("thread " + thread + " will linger despite being asked to die via interruption");
            }
        }
        if (!uncooperativeThreads.isEmpty()) {
            getLog().warn("NOTE: "
                    + uncooperativeThreads.size()
                    + " thread(s) did not finish despite being asked to "
                    + " via interruption. This is not a problem with exec:java, it is a problem with the running code."
                    + " Although not serious, it should be remedied.");
        } else {
            int activeCount = threadGroup.activeCount();
            if (activeCount != 0) {
                Thread[] threadsArray = new Thread[1];
                threadGroup.enumerate(threadsArray);
                getLog().debug("strange; " + activeCount + " thread(s) still active in the group "
                        + threadGroup + " such as " + threadsArray[0]);
            }
        }
    }

    class IsolatedThreadGroup extends ThreadGroup {
        Throwable uncaughtException; // synchronize access to this

        public IsolatedThreadGroup(String name) {
            super(name);
        }

        public void uncaughtException(Thread thread, Throwable throwable) {
            if (throwable instanceof ThreadDeath) {
                return; // harmless
            }
            boolean doLog = false;
            synchronized (this) {
                // only remember the first one
                if (uncaughtException == null) {
                    uncaughtException = throwable; // will be reported
                    // eventually
                } else {
                    doLog = true;
                }
            }
            if (doLog) {
                getLog().warn("an additional exception was thrown", throwable);
            }
        }
    }


}
