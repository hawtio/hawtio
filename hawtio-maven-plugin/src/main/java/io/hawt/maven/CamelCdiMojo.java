package io.hawt.maven;

import java.util.List;
import java.util.Set;

import org.apache.maven.artifact.Artifact;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.Execute;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.ResolutionScope;

@Mojo(name = "camel-cdi", defaultPhase = LifecyclePhase.PROCESS_TEST_CLASSES, requiresDependencyResolution = ResolutionScope.RUNTIME)
@Execute(phase = LifecyclePhase.PROCESS_TEST_CLASSES)
public class CamelCdiMojo extends RunMojo {

    protected Artifact camelCoreArtifact;

    @Override
    protected void addCustomArguments(List<String> args) {
        // must include plugin dependencies for cdi
        extraPluginDependencyArtifactId = "camel-cdi";

        if (mainClass != null) {
            getLog().info("Using custom " + mainClass + " to initiate Camel");
        } else {
            mainClass = "org.apache.camel.cdi.Main";
            // use CDI by default
            getLog().info("Using " + mainClass + " to initiate a CamelContext");
        }
    }

    protected Artifact getCamelCoreArtifact(Set<Artifact> artifacts) throws MojoExecutionException {
        for (Artifact artifact : artifacts) {
            if (artifact.getGroupId().equals("org.apache.camel") && artifact.getArtifactId().equals("camel-core")) {
                return artifact;
            }
        }
        return null;
    }

    protected Artifact getCamelCdiArtifact(Set<Artifact> artifacts) throws MojoExecutionException {
        for (Artifact artifact : artifacts) {
            if (artifact.getGroupId().equals("org.apache.camel") && artifact.getArtifactId().equals("camel-cdi")) {
                return artifact;
            }
        }
        return null;
    }

    @Override
    protected void resolvedArtifacts(Set<Artifact> artifacts) throws Exception {
        camelCoreArtifact = getCamelCoreArtifact(artifacts);
        if (camelCoreArtifact == null) {
            throw new IllegalAccessError("Cannot resolve camel-core dependency from the Maven pom.xml file");
        }

        // try to find camel-cdi which we need
        Artifact camelCdi = getCamelCdiArtifact(artifacts);
        if (camelCdi == null) {
            camelCdi = artifactFactory.createArtifact("org.apache.camel", "camel-cdi", camelCoreArtifact.getVersion(), null, "jar");
            Set<Artifact> extras = resolveExecutableDependencies(camelCdi);
            if (extras.isEmpty()) {
                throw new IllegalAccessError("Cannot resolve camel-cdi dependency from the Maven pom.xml file");
            }

            for (Artifact extra : extras) {
                getLog().debug("Extra artifact: " + extra);
                if (Artifact.SCOPE_TEST.equals(extra.getScope())) {
                    continue;
                }
                if (!artifacts.contains(extra)) {
                    getLog().debug("Adding extra artifact: " + extra);
                    artifacts.add(extra);
                }
            }
        }

        super.resolvedArtifacts(artifacts);
    }

}
