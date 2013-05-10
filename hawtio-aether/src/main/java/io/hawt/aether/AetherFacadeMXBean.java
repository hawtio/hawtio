package io.hawt.aether;

import org.codehaus.plexus.PlexusContainerException;
import org.codehaus.plexus.component.repository.exception.ComponentLookupException;
import org.sonatype.aether.collection.DependencyCollectionException;
import org.sonatype.aether.resolution.ArtifactResolutionException;
import org.sonatype.aether.resolution.DependencyResolutionException;

/**
 */
public interface AetherFacadeMXBean {
    String resolveJson(String mavenCoords) throws ComponentLookupException, DependencyCollectionException, PlexusContainerException, ArtifactResolutionException, DependencyResolutionException;

    String resolveJson(String groupId, String artifactId, String version, String extension, String classifier) throws ComponentLookupException, DependencyCollectionException, PlexusContainerException, ArtifactResolutionException, DependencyResolutionException;
}
