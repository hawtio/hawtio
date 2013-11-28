package io.hawt.maven.indexer;

import org.codehaus.plexus.util.StringUtils;

/**
 * Represents information about an artifact in a repository
 */
public class ArtifactDTO {
    private final String groupId;
    private final String artifactId;
    private final String version;
    private final String packaging;
    private final String classifier;
    private final String description;
    private final long lastModified;
    private final String name;
    private final String bundleSymbolicName;

    public ArtifactDTO(String groupId, String artifactId, String version, String packaging, String classifier, String description, long lastModified, String name, String bundleSymbolicName) {
        this.groupId = groupId;
        this.artifactId = artifactId;
        this.version = version;
        this.packaging = packaging;
        this.classifier = classifier;
        this.description = description;
        this.lastModified = lastModified;
        this.name = name;
        this.bundleSymbolicName = bundleSymbolicName;
    }

    @Override
    public String toString() {
        return "ArtifactDTO(" + groupId + "/" + artifactId + "/" + version +
                (StringUtils.isNotBlank(packaging) ? "/" + packaging : "") +
                (StringUtils.isNotBlank(classifier) ? "/" + classifier : "") + ")";
    }

    public String getArtifactId() {
        return artifactId;
    }

    public String getBundleSymbolicName() {
        return bundleSymbolicName;
    }

    public String getClassifier() {
        return classifier;
    }

    public String getDescription() {
        return description;
    }

    public String getGroupId() {
        return groupId;
    }

    public long getLastModified() {
        return lastModified;
    }

    public String getName() {
        return name;
    }

    public String getPackaging() {
        return packaging;
    }

    public String getVersion() {
        return version;
    }
}
