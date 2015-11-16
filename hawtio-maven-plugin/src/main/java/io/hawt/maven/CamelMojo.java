package io.hawt.maven;

import java.util.List;
import java.util.Set;

import org.apache.maven.artifact.Artifact;
import org.apache.maven.model.Plugin;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.Execute;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;
import org.codehaus.plexus.util.xml.Xpp3Dom;

@Mojo(name = "camel", defaultPhase = LifecyclePhase.PROCESS_TEST_CLASSES, requiresDependencyResolution = ResolutionScope.RUNTIME)
@Execute(phase = LifecyclePhase.PROCESS_TEST_CLASSES)
public class CamelMojo extends RunMojo {

    @Parameter(property = "hawtio.applicationContextUri")
    private String applicationContextUri;

    @Parameter(property = "hawtio.fileApplicationContextUri")
    private String fileApplicationContextUri;

    protected Artifact camelCoreArtifact;

    @Override
    protected void addCustomArguments(List<String> args) throws Exception {
        if (applicationContextUri != null) {
            args.add("-ac");
            args.add(applicationContextUri);
        } else if (fileApplicationContextUri != null) {
            args.add("-fa");
            args.add(fileApplicationContextUri);
        }

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
            // use spring by default
            getLog().info("Using org.apache.camel.spring.Main to initiate Camel");
            mainClass = "org.apache.camel.spring.Main";
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

    @Override
    protected void resolvedArtifacts(Set<Artifact> artifacts) throws Exception {
        // make sure we have camel-core
        camelCoreArtifact = getCamelCoreArtifact(artifacts);
        if (camelCoreArtifact == null) {
            throw new IllegalAccessError("Cannot resolve camel-core dependency from the Maven pom.xml file");
        }

        super.resolvedArtifacts(artifacts);
    }

    @Override
    protected boolean filterUnwantedArtifacts(Artifact artifact) {
        // filter out unwanted OSGi related JARs as some projects like ActiveMQ includes these dependencies
        // and you should use the camel-blueprint goal for running as OSGi
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
