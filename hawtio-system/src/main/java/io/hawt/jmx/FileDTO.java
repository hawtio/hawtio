package io.hawt.jmx;

import java.io.File;

/**
 * File DTO
 */
public class FileDTO {

    private String absolutePath;
    private String fileName;
    private long length;

    public FileDTO(File file) {
        this.absolutePath = file.getAbsolutePath();
        this.fileName = file.getName();
        this.length = file.length();
    }

    public String getAbsolutePath() {
        return absolutePath;
    }

    public void setAbsolutePath(String absolutePath) {
        this.absolutePath = absolutePath;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public long getLength() {
        return length;
    }

    public void setLength(long length) {
        this.length = length;
    }
}
