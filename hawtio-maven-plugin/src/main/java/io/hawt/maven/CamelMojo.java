package io.hawt.maven;

import java.util.List;

import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;

@Mojo(name = "camel", defaultPhase = LifecyclePhase.TEST_COMPILE, requiresDependencyResolution = ResolutionScope.RUNTIME)
public class CamelMojo extends RunMojo {

    @Parameter(property = "camel.applicationContextUri")
    private String applicationContextUri;

    @Parameter(property = "camel.fileApplicationContextUri")
    private String fileApplicationContextUri;

    @Override
    protected void addCustomArguments(List<String> args) {
        if (applicationContextUri != null) {
            args.add("-ac");
            args.add(applicationContextUri);
        } else if (fileApplicationContextUri != null) {
            args.add("-fa");
            args.add(fileApplicationContextUri);
        }

        if (mainClass != null) {
            getLog().info("Using custom " + mainClass + " to initiate a CamelContext");
        } else {
            // use spring by default
            getLog().info("Using org.apache.camel.spring.Main to initiate a CamelContext");
            mainClass = "org.apache.camel.spring.Main";
        }
    }
}
