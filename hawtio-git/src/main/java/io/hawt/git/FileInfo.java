package io.hawt.git;

import io.hawt.util.XmlHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
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
    private String[] xmlNamespaces;

    public static FileInfo createFileInfo(File rootDir, File file) {
        String path = getRelativePath(rootDir, file).replace("\\", "/");
        FileInfo answer = new FileInfo(path, file.getName(), file.lastModified(), file.length(), file.isDirectory());
        if (file.isFile() && file.getName().endsWith(".xml")) {
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

    public FileInfo(String path, String name, long lastModified, long length, boolean directory) {
        this.path = path;
        this.name = name;
        this.lastModified = lastModified;
        this.length = length;
        this.directory = directory;
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

    public void setXmlNamespaces(String[] xmlNamespaces) {
        this.xmlNamespaces = xmlNamespaces;
    }

    public String[] getXmlNamespaces() {
        return xmlNamespaces;
    }
}
