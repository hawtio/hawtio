package io.hawt.aether;

import org.codehaus.plexus.PlexusContainerException;
import org.codehaus.plexus.component.repository.exception.ComponentLookupException;
import org.sonatype.aether.collection.DependencyCollectionException;
import org.sonatype.aether.resolution.ArtifactResolutionException;
import org.sonatype.aether.resolution.DependencyResolutionException;

import java.net.MalformedURLException;

/**
 */
public interface AetherFacadeMXBean {
    String resolveJson(String mavenCoords) throws ComponentLookupException, DependencyCollectionException, PlexusContainerException, ArtifactResolutionException, DependencyResolutionException;

    String resolveJson(String groupId, String artifactId, String version, String extension, String classifier) throws ComponentLookupException, DependencyCollectionException, PlexusContainerException, ArtifactResolutionException, DependencyResolutionException;


    /**
     * Resolves the set of maven coordinates of the form <code>group/artifact/version[/classifier/type]</code> to a local file name on the local machine
     */
    String resolveUrlToFileName(String mvnUrl) throws MalformedURLException, ComponentLookupException, DependencyCollectionException, PlexusContainerException, DependencyResolutionException, ArtifactResolutionException;


}
