package io.hawt.git;

import java.util.Date;

/**
 * Represents information about a commit log or history
 */
public class CommitInfo {
    private final String commitHashText;
    private final String name;
    private final String author;
    private final Date date;
    private final boolean merge;
    private final String trimmedMessage;
    private final String shortMessage;

    public CommitInfo(String commitHashText, String name, String author, Date date, boolean merge, String trimmedMessage, String shortMessage) {
        this.commitHashText = commitHashText;
        this.name = name;
        this.author = author;
        this.date = date;
        this.merge = merge;
        this.trimmedMessage = trimmedMessage;
        this.shortMessage = shortMessage;
    }

    @Override
    public String toString() {
        return "CommitInfo(hash " + commitHashText + " author " + author + " date " + date + " merge " + merge + " " + shortMessage + ")";
    }

    public String getAuthor() {
        return author;
    }

    public String getCommitHashText() {
        return commitHashText;
    }

    public Date getDate() {
        return date;
    }

    public boolean isMerge() {
        return merge;
    }

    public String getName() {
        return name;
    }

    public String getShortMessage() {
        return shortMessage;
    }

    public String getTrimmedMessage() {
        return trimmedMessage;
    }
}
