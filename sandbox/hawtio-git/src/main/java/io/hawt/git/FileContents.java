package io.hawt.git;

import java.util.List;

/**
 * Represents the text of a text file or a directory
 */
public class FileContents {
    private boolean directory;
    private List<FileInfo> children;
    private String text;

    public FileContents(boolean directory, String text, List<FileInfo> children) {
        this.directory = directory;
        this.text = text;
        this.children = children;
    }

    public List<FileInfo> getChildren() {
        return children;
    }

    public String getText() {
        return text;
    }

    public boolean isDirectory() {
        return directory;
    }
}
