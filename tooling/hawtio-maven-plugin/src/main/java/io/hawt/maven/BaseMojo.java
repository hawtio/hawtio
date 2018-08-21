package io.hawt.maven;

import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
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
import org.apache.maven.plugins.annotations.Component;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.project.MavenProject;
import org.apache.maven.project.MavenProjectBuilder;
import org.apache.maven.project.artifact.MavenMetadataSource;

public abstract class BaseMojo extends AbstractMojo {

    MojoLifecycle mojoLifecycle;

    @Component
    MavenProject project;

    @Component
    ArtifactResolver artifactResolver;

    @Component
    ArtifactFactory artifactFactory;

    @Component
    MavenProjectBuilder projectBuilder;

    @Component
    ArtifactMetadataSource metadataSource;

    @Parameter(property = "localRepository", readonly = true, required = true)
    ArtifactRepository localRepository;

    @Parameter(property = "project.remoteArtifactRepositories")
    List<?> remoteRepositories;

    @Parameter(readonly = true, property = "plugin.artifacts")
    List<Artifact> pluginDependencies;

    @Parameter(readonly = true, property = "project.dependencyArtifacts")
    Set<Artifact> projectDependencies;

    @Parameter(property = "hawtio.logClasspath", defaultValue = "false")
    boolean logClasspath;

    @Parameter(property = "hawtio.logDependencies", defaultValue = "false")
    boolean logDependencies;

    String extraPluginDependencyArtifactId;
    String extendedPluginDependencyArtifactId;

    protected void doBeforeExecute() {
        mojoLifecycle = createMojoLifecycle();
    }

    protected abstract MojoLifecycle createMojoLifecycle();

    /**
     * Set up a classloader for the execution of the main class.
     *
     * @return the classloader
     * @throws org.apache.maven.plugin.MojoExecutionException
     */
    protected ClassLoader getClassLoader(Set<Artifact> artifacts) throws Exception {
        Set<URL> classpathURLs = new LinkedHashSet<URL>();

        addCustomClasspaths(classpathURLs, true);

        // add ourselves to top of classpath
        URL mainClasses = new File(project.getBuild().getOutputDirectory()).toURI().toURL();
        getLog().debug("Adding to classpath : " + mainClasses);
        classpathURLs.add(mainClasses);

        for (Artifact artifact : artifacts) {
            File file = artifact.getFile();
            if (file != null) {
                classpathURLs.add(file.toURI().toURL());
            }
        }

        addCustomClasspaths(classpathURLs, false);

        if (logClasspath) {
            getLog().info("Classpath (" + classpathURLs.size() + " entries):");
            for (URL url : classpathURLs) {
                getLog().info("  " + url.getFile().toString());
            }
        }
        return new URLClassLoader(classpathURLs.toArray(new URL[classpathURLs.size()]));
    }

    /**
     * To add any custom urls to the classpath
     *
     * @param classpathURLs the resolved classpaths
     */
    protected void addCustomClasspaths(Set<URL> classpathURLs, boolean first) throws Exception {
        // noop
    }

    protected Set<Artifact> resolveArtifacts() throws Exception {
        Set<Artifact> artifacts = new LinkedHashSet<Artifact>();

        // project classpath must be first
        this.addRelevantProjectDependencies(artifacts);
        // and extra plugin classpath
        this.addExtraPluginDependencies(artifacts);
        // and plugin classpath last
        this.addRelevantPluginDependencies(artifacts);

        Iterator<Artifact> it = artifacts.iterator();
        while (it.hasNext()) {
            Artifact artifact = it.next();
            if (filterUnwantedArtifacts(artifact)) {
                getLog().info("Removing unwanted artifact: " + artifact);
                it.remove();
            }
        }

        return artifacts;
    }

    protected void resolvedArtifacts(Set<Artifact> artifacts) throws Exception {
        if (logDependencies) {
            List<Artifact> sorted = new ArrayList<Artifact>(artifacts);
            Collections.sort(sorted);
            getLog().info("Artifact (" + sorted.size() + " entries):");
            for (Artifact artifact : sorted) {
                getLog().info("  " + artifact.getGroupId() + ":" + artifact.getArtifactId() + ":" + artifact.getType() + ":" + artifact.getVersion() + ":" + artifact.getScope());
            }
        }
    }

    /**
     * Filter unwanted artifacts
     *
     * @param artifact  the artifact
     * @return <tt>true</tt> to skip this artifact, <tt>false</tt> to keep it
     */
    protected boolean filterUnwantedArtifacts(Artifact artifact) {
        // filter out maven and plexus stuff (plexus used by maven plugins)
        if (artifact.getGroupId().startsWith("org.apache.maven")) {
            return true;
        } else if (artifact.getGroupId().startsWith("org.codehaus.plexus")) {
            return true;
        }

        return false;
    }

    /**
     * Add any relevant project dependencies to the classpath. Takes
     * includeProjectDependencies into consideration.
     */
    @SuppressWarnings("unchecked")
    protected void addRelevantProjectDependencies(Set<Artifact> artifacts) throws Exception {
        getLog().debug("Project Dependencies will be included.");

        Set<Artifact> dependencies = project.getArtifacts();
        getLog().debug("There are " + dependencies.size() + " dependencies in the project");

        // system scope dependencies are not returned by maven 2.0. See MEXEC-17
        dependencies.addAll(getAllNonTestOrProvidedScopedDependencies());

        Iterator<Artifact> iter = dependencies.iterator();
        while (iter.hasNext()) {
            Artifact classPathElement = iter.next();
            getLog().debug("Adding project dependency artifact: " + classPathElement.getArtifactId() + " to classpath");

            artifacts.add(classPathElement);
        }
    }

    /**
     * Add any relevant project dependencies to the classpath. Indirectly takes
     * includePluginDependencies and ExecutableDependency into consideration.
     */
    protected void addExtraPluginDependencies(Set<Artifact> artifacts) throws MojoExecutionException {
        if (extraPluginDependencyArtifactId == null && extendedPluginDependencyArtifactId == null) {
            return;
        }

        Set<Artifact> deps = new HashSet<Artifact>(this.pluginDependencies);
        for (Artifact artifact : deps) {
            // must
            if (artifact.getArtifactId().equals(extraPluginDependencyArtifactId)
                    || artifact.getArtifactId().equals(extendedPluginDependencyArtifactId)) {

                getLog().debug("Adding extra plugin dependency artifact: " + artifact.getArtifactId() + " to classpath");
                artifacts.add(artifact);

                // add the transient dependencies of this artifact
                Set<Artifact> resolvedDeps = resolveExecutableDependencies(artifact);
                for (Artifact dep : resolvedDeps) {
                    getLog().debug("Adding extra plugin dependency artifact: " + dep.getArtifactId() + " to classpath");
                    artifacts.add(dep);
                }
            }
        }
    }

    /**
     * Add any relevant project dependencies to the classpath.
     */
    protected void addRelevantPluginDependencies(Set<Artifact> artifacts) throws MojoExecutionException {
        if (pluginDependencies == null) {
            return;
        }

        Iterator<Artifact> iter = this.pluginDependencies.iterator();
        while (iter.hasNext()) {
            Artifact classPathElement = iter.next();
            getLog().debug("Adding plugin dependency artifact: " + classPathElement.getArtifactId() + " to classpath");
            artifacts.add(classPathElement);
        }
    }

    protected Collection<Artifact> getAllNonTestOrProvidedScopedDependencies() throws Exception {
        List<Artifact> answer = new ArrayList<Artifact>();

        for (Artifact artifact : getAllDependencies()) {

            // do not add test or provided artifacts
            if (!artifact.getScope().equals(Artifact.SCOPE_TEST) && !artifact.getScope().equals(Artifact.SCOPE_PROVIDED)) {
                answer.add(artifact);
            }
        }
        return answer;
    }

    // generic method to retrieve all the transitive dependencies
    protected Collection<Artifact> getAllDependencies() throws Exception {
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
    protected Artifact getExecutablePomArtifact(Artifact executableArtifact) {
        return this.artifactFactory.createBuildArtifact(executableArtifact.getGroupId(), executableArtifact
                .getArtifactId(), executableArtifact.getVersion(), "pom");
    }

    @SuppressWarnings("unchecked")
    protected Set<Artifact> resolveExecutableDependencies(Artifact executablePomArtifact) throws MojoExecutionException {

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

}
