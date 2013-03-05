package io.hawt.git;

import java.io.File;
import java.io.IOException;

/**
 */
public class FileInfo {
    private final String path;
    private final String name;
    private final long lastModified;
    private final long length;
    private final boolean directory;

    public static FileInfo createFileInfo(File rootDir, File file) {
        String path = getRelativePath(rootDir, file).replace("\\", "/");
        return new FileInfo(path, file.getName(), file.lastModified(), file.length(), file.isDirectory());
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
}
