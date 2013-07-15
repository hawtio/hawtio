package io.hawt.git;

import org.eclipse.jgit.api.errors.GitAPIException;

import java.io.IOException;
import java.util.List;

/**
 * The JMX MBean interface for working with git configuration files
 */
public interface GitFacadeMXBean {
    /**
     * Reads the contents of a file or a directory
     */
    FileContents read(String branch, String path) throws IOException, GitAPIException;

    void write(String branch, String path, String commitMessage,
               String authorName, String authorEmail, String contents);

    /**
     * Renames the given oldPath to the newPath location for the given branch, commit message and user
     */
    void rename(String branch, String oldPath, String newPath, String commitMessage,
                String authorName, String authorEmail);

    void remove(String branch, String path, String commitMessage,
                String authorName, String authorEmail);

    String getHEAD();

    /**
     * Return the history of the repository or a specific directory or file path
     */
    List<CommitInfo> history(String objectId, String path, int limit);

    /**
     * Get the contents of a blobPath for a given commit objectId
     */
    String getContent(String objectId, String blobPath);

    /**
     * Reads the child JSON file contents which match the given search string (if specified) and which match the given file name wildcard (using * to match any characters in the name).
     */
    String readJsonChildContent(String branch, String path, String fileNameWildcard, String search) throws IOException;

    /**
     * Performs a diff of the latest or a specifc version of the given blobPath
     * against either the previous or a given baseObjectId
     */
    String diff(String objectId, String baseObjectId, String blobPath);

    /**
     * Reverts the file to a previous value
     */
    void revertTo(String branch, String objectId, String blobPath, String commitMessage,
                  String authorName, String authorEmail);

    /**
     * Returns all the branch names we can use in the local repo
     */
    List<String> branches();
}
