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

@Mojo(name = "spring-boot", defaultPhase = LifecyclePhase.PROCESS_TEST_CLASSES, requiresDependencyResolution = ResolutionScope.RUNTIME)
@Execute(phase = LifecyclePhase.PROCESS_TEST_CLASSES)
public class SpringBootMojo extends BaseRunMojo {

    // do not use 8080 as that may clash with spring-boot use as default
    @Parameter(property = "hawtio.port", defaultValue = "9191")
    int port;

    protected Artifact springCoreArtifact;

    @Override
    public int getPort() {
        return port;
    }

    @Override
    protected void addCustomArguments(List<String> args) throws Exception {
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
                } else if ("org.springframework.boot".equals(plugin.getGroupId()) && "spring-boot-maven-plugin".equals(plugin.getArtifactId())) {
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
            getLog().info("Using custom " + mainClass + " to initiate Spring");
        } else {
            getLog().info("Using io.hawt.maven.main.SpringBoot to initiate Spring");
            mainClass = "io.hawt.maven.main.SpringBoot";
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

}
