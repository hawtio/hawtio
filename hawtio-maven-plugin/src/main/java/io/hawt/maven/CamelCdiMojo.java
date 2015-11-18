package io.hawt.maven;

import java.util.List;
import java.util.Set;

import org.apache.maven.artifact.Artifact;
import org.apache.maven.model.Plugin;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.Execute;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.ResolutionScope;
import org.codehaus.plexus.util.xml.Xpp3Dom;

@Mojo(name = "camel-cdi", defaultPhase = LifecyclePhase.PROCESS_TEST_CLASSES, requiresDependencyResolution = ResolutionScope.RUNTIME)
@Execute(phase = LifecyclePhase.PROCESS_TEST_CLASSES)
public class CamelCdiMojo extends RunMojo {

    protected Artifact camelCoreArtifact;

    @Override
    protected void addCustomArguments(List<String> args) {
        // must include plugin dependencies for cdi
        extraPluginDependencyArtifactId = "camel-cdi";

        // if no mainClass configured then try to find it from camel-maven-plugin
        if (mainClass == null && project.getBuildPlugins() != null) {
            for (Object obj : project.getBuildPlugins()) {
                Plugin plugin = (Plugin) obj;
                if ("org.apache.camel".equals(plugin.getGroupId()) && "camel-maven-plugin".equals(plugin.getArtifactId())) {
                    Object config = plugin.getConfiguration();
                    if (config instanceof Xpp3Dom) {
                        Xpp3Dom dom = (Xpp3Dom) config;
                        Xpp3Dom child = dom.getChild("mainClass");
                        if (child != null) {
                            mainClass = child.getValue();
                        }
                    }
                }
            }
        }

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
