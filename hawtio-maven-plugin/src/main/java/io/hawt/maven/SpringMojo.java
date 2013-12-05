package io.hawt.maven;

import java.util.List;
import java.util.Set;

import org.apache.maven.artifact.Artifact;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.Execute;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;

@Mojo(name = "spring", defaultPhase = LifecyclePhase.PROCESS_TEST_CLASSES, requiresDependencyResolution = ResolutionScope.RUNTIME)
@Execute(phase = LifecyclePhase.PROCESS_TEST_CLASSES)
public class SpringMojo extends RunMojo {

    @Parameter(property = "hawtio.applicationContextUri")
    private String applicationContextUri;

    @Parameter(property = "hawtio.fileApplicationContextUri")
    private String fileApplicationContextUri;

    protected Artifact springCoreArtifact;

    @Override
    protected void addCustomArguments(List<String> args) throws Exception {
        if (applicationContextUri != null) {
            args.add("-ac");
            args.add(applicationContextUri);
        } else if (fileApplicationContextUri != null) {
            args.add("-fa");
            args.add(fileApplicationContextUri);
        }

        if (mainClass != null) {
            getLog().info("Using custom " + mainClass + " to initiate Spring");
        } else {
            // use spring by default
            getLog().info("Using io.hawt.maven.main.SpringMain to initiate Spring");
            mainClass = "io.hawt.maven.main.SpringMain";
        }
    }

    protected Artifact getSpringCoreArtifact(Set<Artifact> artifacts) throws MojoExecutionException {
        for (Artifact artifact : artifacts) {
            if (artifact.getGroupId().equals("org.springframework") && artifact.getArtifactId().equals("spring-core")) {
                return artifact;
            }
        }
        return null;
    }

    @Override
    protected void resolvedArtifacts(Set<Artifact> artifacts) throws Exception {
        // make sure we have spring-core
        springCoreArtifact = getSpringCoreArtifact(artifacts);
        if (springCoreArtifact == null) {
            throw new IllegalAccessError("Cannot resolve camel-core dependency from the Maven pom.xml file");
        }

        super.resolvedArtifacts(artifacts);
    }

    @Override
    protected boolean filterUnwantedArtifacts(Artifact artifact) {
        // filter out unwanted OSGi related JARs as some projects like ActiveMQ includes these dependencies
        // and you should use the blueprint goal for running as OSGi
        if (artifact.getGroupId().equals("org.apache.aries.blueprint")) {
            return true;
        } else if (artifact.getGroupId().startsWith("org.ops4j")) {
            return true;
        } else if (artifact.getGroupId().equals("org.osgi")) {
            return true;
        } else if (artifact.getGroupId().equals("org.apache.felix")) {
            return true;
        }

        return super.filterUnwantedArtifacts(artifact);
    }
}
