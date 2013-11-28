package io.hawt.maven.indexer;

import java.io.IOException;
import java.util.List;

/**
 * The MBean for working with the MavenIndexer
 */
public interface MavenIndexerFacadeMXBean {
    /**
     * Returns the latest version of each artifact that matches any of the given strings like groupId or groupId and artifactId etc
     */
    public List<ArtifactDTO> search(String groupId, String artifactId, String version, String packaging, String classifier, String className) throws IOException;

    /**
     * Returns all versions and artifacts that match the given query; such as to find all versions of a given groupId and artifactId.
     */
    List<ArtifactDTO> searchFlat(String groupId, String artifactId, String version, String packaging, String classifier, String className) throws IOException;

    /**
     * Returns the latest version of each artifact which contains the given class name text
     */
    List<ArtifactDTO> searchClasses(String classNameSearchText) throws IOException;

    /**
     * Searches for all artifacts for the given text, returning the latest matching artifact version
     */
    List<ArtifactDTO> searchText(String searchText) throws IOException;

    /**
     * Searches for all artifacts for the given text with the optional packaging/classifier filter,
     * returning the latest matching artifact version
     */
    List<ArtifactDTO> searchTextAndPackaging(String searchText, String packaging, String classifier) throws IOException;

    /**
     * Helper method to complete the possible group IDs for a given partial group ID and possible packaging and/or classifier
     */
    List<String> groupIdComplete(String groupId, String packaging, String classifier) throws IOException;

    /**
     * Helper method to complete the possible artifact IDs for a given group ID, partial artifact ID and possible packaging and/or classifier
     */
    List<String> artifactIdComplete(String groupId, String artifactId, String packaging, String classifier) throws IOException;

    /**
     * Helper method to complete the possible versions for a given group ID, artifact, partial version and possible packaging and/or classifier
     */
    List<String> versionComplete(String groupId, String artifactId, String version, String packaging, String classifier) throws IOException;

    /**
     * Returns the current list of maven repositories
     */
    String[] getRepositories();
}
