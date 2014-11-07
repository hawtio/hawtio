package io.hawt.git;

import io.hawt.util.Files;
import io.hawt.util.IOHelper;
import io.hawt.util.Strings;
import io.hawt.util.XmlHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.util.Properties;
import java.util.Set;

/**
 */
public class FileInfo {
    private static final transient Logger LOG = LoggerFactory.getLogger(FileInfo.class);

    private final String path;
    private final String name;
    private final long lastModified;
    private final long length;
    private final boolean directory;
    private final String mimeType;
    private String[] xmlNamespaces;
    private String iconUrl;
    private String summary;
    private String displayName;
    private String version;
    private String groupId;
    private String artifactId;

    public static FileInfo createFileInfo(File rootDir, File file, String branch) {
        if (Strings.isBlank(branch)) {
            branch = "master";
        }
        String path = getRelativePath(rootDir, file).replace("\\", "/");
        String mimeType = Files.getMimeType(file);
        FileInfo answer = new FileInfo(path, file.getName(), file.lastModified(), file.length(), file.isDirectory(), mimeType);
        if (file.isFile()) {
            String name = file.getName();
            if (name.indexOf('#') > 0) {
                name = name.substring(0, name.indexOf('#'));
            }
            if (name.endsWith(".xml")) {
                // lets load the XML namespaces
                try {
                    Set<String> uris = XmlHelper.getNamespaces(file);
                    if (uris.size() > 0) {
                        String[] namespaces = uris.toArray(new String[uris.size()]);
                        answer.setXmlNamespaces(namespaces);
                    }
                } catch (Exception e) {
                    LOG.warn("Failed to parse the XML namespaces in " + file + " due: " + e.getMessage() + ". This exception is ignored.", e);
                }
            }
        } else {
            File[] icons = file.listFiles(new FilenameFilter() {
                @Override
                public boolean accept(File dir, String name) {
                    if (name == null) {
                        return false;
                    }
                    String lower = name.toLowerCase();
                    return lower.startsWith("icon.") &&
                            (lower.endsWith(".svg") || lower.endsWith(".png") || lower.endsWith(".gif") || lower.endsWith(".jpg") || lower.endsWith(".jpeg"));
                }
            });
            if (icons != null && icons.length > 0) {
                File icon = icons[0];
                String relativePath = getRelativePath(rootDir, icon);
                if (!relativePath.startsWith("/")) {
                    relativePath = "/" + relativePath;
                }
                answer.iconUrl = branch + relativePath;
            }
            File summary = new File(file, "Summary.md");
            if (summary.exists() && summary.isFile()) {
                try {
                    answer.summary = IOHelper.readFully(summary);
                } catch (IOException e) {
                    LOG.warn("Failed to load summary file " + summary + ". " + e, e);
                }
            }
            File fabric8PropertiesFile = new File(file, "fabric8.properties");
            if (fabric8PropertiesFile.exists() && fabric8PropertiesFile.isFile()) {
                try {
                    Properties fabric8Properties = new Properties();
                    fabric8Properties.load(new FileReader(fabric8PropertiesFile));
                    answer.displayName = fabric8Properties.getProperty("name");
                    answer.groupId = fabric8Properties.getProperty("groupId");
                    answer.artifactId = fabric8Properties.getProperty("artifactId");
                    answer.version = fabric8Properties.getProperty("version");
                } catch (IOException e) {
                    LOG.warn("Failed to load fabric8 properties file " + fabric8PropertiesFile + ". " + e, e);
                }
            }
        }
        return answer;
    }

    public static String getRelativePath(File rootDir, File file) {
        try {
            String rootPath = rootDir.getCanonicalPath();
            String fullPath = file.getCanonicalPath();
            if (fullPath.startsWith(rootPath)) {
                return fullPath.substring(rootPath.length());
            } else {
                return fullPath;
            }
        } catch (IOException e) {
            throw new RuntimeIOException(e);
        }
    }

    public FileInfo(String path, String name, long lastModified, long length, boolean directory, String mimeType) {
        this.path = path;
        this.name = name;
        this.lastModified = lastModified;
        this.length = length;
        this.directory = directory;
        this.mimeType = mimeType;
    }

    @Override
    public String toString() {
        return "FileInfo(" + path + ")";
    }

    public boolean isDirectory() {
        return directory;
    }

    public long getLastModified() {
        return lastModified;
    }

    public long getLength() {
        return length;
    }

    public String getName() {
        return name;
    }

    public String getPath() {
        return path;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setXmlNamespaces(String[] xmlNamespaces) {
        this.xmlNamespaces = xmlNamespaces;
    }

    public String[] getXmlNamespaces() {
        return xmlNamespaces;
    }

    public String getIconUrl() {
        return iconUrl;
    }

    public void setIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getArtifactId() {
        return artifactId;
    }

    public void setArtifactId(String artifactId) {
        this.artifactId = artifactId;
    }

}
