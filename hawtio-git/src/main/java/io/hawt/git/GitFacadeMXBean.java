package io.hawt.git;

import java.io.IOException;
import java.util.List;

import org.eclipse.jgit.api.errors.GitAPIException;

/**
 * The JMX MBean interface for working with git configuration files
 */
public interface GitFacadeMXBean {

    String getRepositoryLabel();

    /**
     * Checks if the file exists and if so what its file metadata is.
     * <p/>
     * Will by default be case in-sensitive, eg checking if <tt>readme.md</tt> exists, will
     * return file data, if the file in git is named <tt>ReadMe.md</tt>.
     *
     * @return the metadata for the given file or null if it does not exist
     */
    FileInfo exists(String branch, String pathOrEmpty) throws IOException, GitAPIException;

    /**
     * Reads the contents of a file or a directory
     */
    FileContents read(String branch, String path) throws IOException, GitAPIException;

    CommitInfo write(String branch, String path, String commitMessage,
                     String authorName, String authorEmail, String contents);

    CommitInfo writeBase64(String branch, String path, String commitMessage,
                           String authorName, String authorEmail, String contentsBase64);

    /**
     * Creates a new file if it doesn't already exist
     *
     * @return the commit metadata for the newly created file or null if it already exists
     */
    CommitInfo createDirectory(String branch, String path, String commitMessage,
                               String authorName, String authorEmail);

    /**
     * Creates a new branch from the given branch
     */
    void createBranch(String fromBranch, String newBranch);

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
    List<CommitInfo> history(String branch, String objectId, String path, int limit);

    /**
     * Returns the commit tree for the given commit id
     */
    List<CommitTreeInfo> getCommitTree(String commitId);

    /**
     * Returns details about the commit, such as its message etc
     */
    CommitInfo getCommitInfo(String commitId);

    /**
     * Get the contents of a blobPath for a given commit objectId
     */
    String getContent(String objectId, String blobPath);

    /**
     * Provides a file/path completion hook so we can start typing the name of a file or directory
     */
    List<String> completePath(String branch, String completionText, boolean directoriesOnly);

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

    void uploadFile(String branch, String path, boolean unzip, String sourceFileName, String destName) throws IOException, GitAPIException;
}
