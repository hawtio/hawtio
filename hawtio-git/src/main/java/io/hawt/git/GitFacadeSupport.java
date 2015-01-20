/**
 * Copyright (C) 2013 the original author or authors.
 * See the notice.md file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.git;

import io.hawt.util.*;
import io.hawt.util.Objects;
import org.eclipse.jgit.api.AddCommand;
import org.eclipse.jgit.api.CommitCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.ListBranchCommand;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.diff.DiffEntry;
import org.eclipse.jgit.diff.DiffEntry.ChangeType;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.diff.RawTextComparator;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.PersonIdent;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.transport.PushResult;
import org.eclipse.jgit.transport.RemoteRefUpdate;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.util.io.DisabledOutputStream;
import org.gitective.core.BlobUtils;
import org.gitective.core.CommitFinder;
import org.gitective.core.CommitUtils;
import org.gitective.core.PathFilterUtils;
import org.gitective.core.filter.commit.CommitLimitFilter;
import org.gitective.core.filter.commit.CommitListFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.util.*;

import static io.hawt.git.GitFacade.trimLeadingSlash;

/**
 * A based class for implementations of {@link GitFacadeMXBean}
 */
public abstract class GitFacadeSupport extends MBeanSupport implements GitFacadeMXBean, GitFileManager {
    private static final transient Logger LOG = LoggerFactory.getLogger(GitFacadeSupport.class);

    private int shortCommitIdLength = 6;
    private String repositoryLabel = "Wiki";

    public void setRepositoryLabel(String repositoryLabel) {
        this.repositoryLabel = repositoryLabel;
    }

    public String getRepositoryLabel() {
        return repositoryLabel;
    }

    protected String doDiff(Git git, String objectId, String baseObjectId, String pathOrBlobPath) {
        Repository r = git.getRepository();
        String blobPath = trimLeadingSlash(pathOrBlobPath);
/*
        RevCommit commit = JGitUtils.getCommit(r, objectId);

        ObjectId current;
        if (isNotBlank(objectId)) {
            current = BlobUtils.getId(r, objectId, blobPath);
        } else {
            current = CommitUtils.getHead(r).getId();
        }
        ObjectId previous;
        if (isNotBlank(baseObjectId)) {
            previous = BlobUtils.getId(r, baseObjectId, blobPath);
        } else {
            RevCommit revCommit = CommitUtils.getCommit(r, current);
            RevCommit[] parents = revCommit.getParents();
            if (parents.length == 0) {
                throw new IllegalArgumentException("No parent commits!");
            } else {
                previous = parents[0];
            }
        }
        Collection<Edit> changes = BlobUtils.diff(r, previous, current);

        // no idea how to format Collection<Edit> :)

*/

        RevCommit commit;
        if (Strings.isNotBlank(objectId)) {
            commit = CommitUtils.getCommit(r, objectId);
        } else {
            commit = CommitUtils.getHead(r);
        }
        RevCommit baseCommit = null;
        if (Strings.isNotBlank(baseObjectId)) {
            baseCommit = CommitUtils.getCommit(r, baseObjectId);
        }

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();

        RawTextComparator cmp = RawTextComparator.DEFAULT;
        DiffFormatter formatter = new DiffFormatter(buffer);
        formatter.setRepository(r);
        formatter.setDiffComparator(cmp);
        formatter.setDetectRenames(true);

        RevTree commitTree = commit.getTree();
        RevTree baseTree;
        try {
            if (baseCommit == null) {
                if (commit.getParentCount() > 0) {
                    final RevWalk rw = new RevWalk(r);
                    RevCommit parent = rw.parseCommit(commit.getParent(0).getId());
                    rw.dispose();
                    baseTree = parent.getTree();
                } else {
                    // FIXME initial commit. no parent?!
                    baseTree = commitTree;
                }
            } else {
                baseTree = baseCommit.getTree();
            }

            List<DiffEntry> diffEntries = formatter.scan(baseTree, commitTree);
            if (blobPath != null && blobPath.length() > 0) {
                for (DiffEntry diffEntry : diffEntries) {
                    if (diffEntry.getNewPath().equalsIgnoreCase(blobPath)) {
                        formatter.format(diffEntry);
                        break;
                    }
                }
            } else {
                formatter.format(diffEntries);
            }
            formatter.flush();
            return buffer.toString();
        } catch (IOException e) {
            throw new RuntimeIOException(e);
        }
    }

    protected abstract void checkoutBranch(Git git, String branch) throws GitAPIException;

    protected abstract boolean isPushOnCommit();

    protected void doCreateBranch(Git git, String fromBranch, String newBranch) throws GitAPIException {
        checkoutBranch(git, fromBranch);
        git.branchCreate().setName(newBranch).call();
        checkoutBranch(git, newBranch);
    }

    /**
     * Returns the file changes in a commit
     */
    protected List<CommitTreeInfo> doGetCommitTree(Git git, String commitId) {
        Repository repository = git.getRepository();
        List<CommitTreeInfo> list = new ArrayList<CommitTreeInfo>();
        RevCommit commit = CommitUtils.getCommit(repository, commitId);
        if (commit != null) {
            RevWalk rw = new RevWalk(repository);
            try {
                if (commit.getParentCount() == 0) {
                    TreeWalk treeWalk = new TreeWalk(repository);
                    treeWalk.reset();
                    treeWalk.setRecursive(true);
                    treeWalk.addTree(commit.getTree());
                    while (treeWalk.next()) {
                        String pathString = treeWalk.getPathString();
                        ObjectId objectId = treeWalk.getObjectId(0);
                        int rawMode = treeWalk.getRawMode(0);
                        list.add(new CommitTreeInfo(pathString, pathString, 0, rawMode, objectId.getName(), commit.getId().getName(),
                                ChangeType.ADD));
                    }
                    treeWalk.release();
                } else {
                    RevCommit parent = rw.parseCommit(commit.getParent(0).getId());
                    DiffFormatter df = new DiffFormatter(DisabledOutputStream.INSTANCE);
                    df.setRepository(repository);
                    df.setDiffComparator(RawTextComparator.DEFAULT);
                    df.setDetectRenames(true);
                    List<DiffEntry> diffs = df.scan(parent.getTree(), commit.getTree());
                    for (DiffEntry diff : diffs) {
                        String objectId = diff.getNewId().name();
                        if (diff.getChangeType().equals(ChangeType.DELETE)) {
                            list.add(new CommitTreeInfo(diff.getOldPath(), diff.getOldPath(), 0, diff
                                    .getNewMode().getBits(), objectId, commit.getId().getName(), diff
                                    .getChangeType()));
                        } else if (diff.getChangeType().equals(ChangeType.RENAME)) {
                            list.add(new CommitTreeInfo(diff.getOldPath(), diff.getNewPath(), 0, diff
                                    .getNewMode().getBits(), objectId, commit.getId().getName(), diff
                                    .getChangeType()));
                        } else {
                            list.add(new CommitTreeInfo(diff.getNewPath(), diff.getNewPath(), 0, diff
                                    .getNewMode().getBits(), objectId, commit.getId().getName(), diff
                                    .getChangeType()));
                        }
                    }
                }
            } catch (Throwable e) {
                LOG.warn("Failed to walk tree for commit " + commitId + ". " + e, e);
            } finally {
                rw.dispose();
            }
        }
        return list;
    }
    

    protected CommitInfo doGetCommitInfo(Git git, String commitId) {
        Repository repository = git.getRepository();
        RevCommit commit = CommitUtils.getCommit(repository, commitId);
        if (commit == null){
            return null;
        } else {
            return createCommitInfo(commit);
        }
    }

    protected abstract Iterable<PushResult> doPush(Git git) throws Exception;


    protected CommitInfo doCreateDirectory(Git git, File rootDir, String branch, String path, PersonIdent personIdent, String commitMessage) throws Exception {
        File file = getFile(rootDir, path);
        if (file.exists()) {
            return null;
        }
        file.mkdirs();
        String filePattern = getFilePattern(path);
        AddCommand add = git.add().addFilepattern(filePattern).addFilepattern(".");
        add.call();

        CommitCommand commit = git.commit().setAll(true).setAuthor(personIdent).setMessage(commitMessage);
        RevCommit revCommit = commitThenPush(git, branch, commit);
        return createCommitInfo(revCommit);
    }

    protected Void doRevert(Git git, File rootDir, String branch, String objectId, String blobPath, String commitMessage, PersonIdent personIdent) throws Exception {
        String contents = doGetContent(git, objectId, blobPath);
        if (contents != null) {
            doWrite(git, rootDir, branch, blobPath, contents.getBytes(), personIdent, commitMessage);
        }
        return null;
    }

    protected RevCommit doRename(Git git, File rootDir, String branch, String oldPath, String newPath, String commitMessage, PersonIdent personIdent) throws Exception {
        File file = getFile(rootDir, oldPath);
        File newFile = getFile(rootDir, newPath);
        if (file.exists()) {
            File parentFile = newFile.getParentFile();
            parentFile.mkdirs();
            if (!parentFile.exists()) {
                throw new IOException("Could not create directory " + parentFile + " when trying to move " + file + " to " + newFile + ". Maybe a file permission issue?");
            }
            file.renameTo(newFile);
            String filePattern = getFilePattern(newPath);
            git.add().addFilepattern(filePattern).call();
            CommitCommand commit = git.commit().setAll(true).setAuthor(personIdent).setMessage(commitMessage);
            return commitThenPush(git, branch, commit);
        } else {
            return null;
        }
    }

    protected RevCommit doRemove(Git git, File rootDir, String branch, String path, String commitMessage, PersonIdent personIdent) throws Exception {
        File file = getFile(rootDir, path);
        if (file.exists()) {
            Files.recursiveDelete(file);

            String filePattern = getFilePattern(path);
            git.rm().addFilepattern(filePattern).call();
            CommitCommand commit = git.commit().setAll(true).setAuthor(personIdent).setMessage(commitMessage);
            return commitThenPush(git, branch, commit);
        } else {
            return null;
        }
    }

    protected List<String> doListBranches(Git git) throws GitAPIException {
        SortedSet<String> names = new TreeSet<String>();
        List<Ref> call = git.branchList().setListMode(ListBranchCommand.ListMode.ALL).call();
        for (Ref ref : call) {
            String name = ref.getName();
            int idx = name.lastIndexOf('/');
            if (idx >= 0) {
                name = name.substring(idx + 1);
            }
            if (name.length() > 0) {
                names.add(name);
            }
        }
        return new ArrayList<String>(names);
    }

    protected String doGetHead(Git git) {
        RevCommit commit = CommitUtils.getHead(git.getRepository());
        return commit.getName();
    }

    protected List<CommitInfo> doHistory(Git git, String branch, String objectId, String pathOrBlobPath, int limit) {
        List<CommitInfo> results = new ArrayList<CommitInfo>();
        Repository r = git.getRepository();

        try {
            String head = getHEAD();
        } catch (Exception e) {
            LOG.error("Cannot find HEAD of this git repository! " + e, e);
            return results;
        }

        String path = trimLeadingSlash(pathOrBlobPath);

        CommitFinder finder = new CommitFinder(r);
        CommitListFilter filter = new CommitListFilter();
        if (Strings.isNotBlank(path)) {
            finder.setFilter(PathFilterUtils.and(path));
        }
        finder.setFilter(filter);

        if (limit > 0) {
            finder.setFilter(new CommitLimitFilter(limit).setStop(true));
        }
        if (Strings.isNotBlank(objectId)) {
            finder.findFrom(objectId);
        } else {
            if (Strings.isNotBlank(branch)) {
                ObjectId branchObjectId = getBranchObjectId(git, branch);
                if (branchObjectId != null) {
                    finder = finder.findFrom(branchObjectId);
                } else {
                    finder = finder.findInBranches();
                }

            } else {
                finder.find();
            }
        }
        List<RevCommit> commits = filter.getCommits();
        for (RevCommit entry : commits) {
            CommitInfo commitInfo = createCommitInfo(entry);
            results.add(commitInfo);
        }
        return results;
    }

    protected ObjectId getBranchObjectId(Git git, String branch) {
        Ref branchRef = null;
        try {
            String branchRevName = "refs/heads/" + branch;
            List<Ref> branches = git.branchList().call();
            for (Ref ref : branches) {
                String revName = ref.getName();
                if (Objects.equals(branchRevName, revName)) {
                    branchRef = ref;
                    break;
                }
            }
        } catch (GitAPIException e) {
            LOG.warn("Failed to find branches " + e, e);
        }

        ObjectId branchObjectId = null;
        if (branchRef != null) {
            branchObjectId = branchRef.getObjectId();
        }
        return branchObjectId;
    }


    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=GitFacade";
    }

    protected String doGetContent(Git git, String objectId, String pathOrBlobPath) {
        objectId = defaultObjectId(git, objectId);
        Repository r = git.getRepository();
        String blobPath = trimLeadingSlash(pathOrBlobPath);
        return BlobUtils.getContent(r, objectId, blobPath);
    }

    protected String defaultObjectId(Git git, String objectId) {
        if (objectId == null || objectId.trim().length() == 0) {
            RevCommit commit = CommitUtils.getHead(git.getRepository());
            objectId = commit.getName();
        }
        return objectId;
    }

    /**
     * Reads the file contents from the currently checked out branch
     */
    protected FileContents doRead(Git git, File rootDir, String branch, String pathOrEmpty) throws IOException, GitAPIException {
        checkoutBranch(git, branch);
        String path = Strings.isBlank(pathOrEmpty) ? "/" : pathOrEmpty;
        File file = getFile(rootDir, path);
        if (file.isFile()) {
            String contents = IOHelper.readFully(file);
            return new FileContents(false, contents, null);
        } else {
            List<FileInfo> children = new ArrayList<FileInfo>();
            if (file.exists()) {
                File[] files = file.listFiles();
                for (File child : files) {
                    if (!isIgnoreFile(child)) {
                        children.add(FileInfo.createFileInfo(rootDir, child, branch));
                    }
                }
            }
            return new FileContents(file.isDirectory(), null, children);
        }
    }

    /**
     * Performs a read only operation on the file
     */
    protected <T> T doReadFile(Git git, File rootDir, String branch, String pathOrEmpty, Function<File, T> callback) throws IOException, GitAPIException {
        checkoutBranch(git, branch);
        String path = Strings.isBlank(pathOrEmpty) ? "/" : pathOrEmpty;
        File file = getFile(rootDir, path);
        T results = callback.apply(file);
        return results;
    }

    /**
     * Performs a write operation on the file
     */
    protected <T> T doWriteFile(Git git, File rootDir, String branch, String pathOrEmpty, WriteCallback callback) throws Exception {
        checkoutBranch(git, branch);
        String path = Strings.isBlank(pathOrEmpty) ? "/" : pathOrEmpty;
        File file = getFile(rootDir, path);
        WriteContext context = new WriteContext(git, rootDir, file);
        T results = (T) callback.apply(context);
        if (context.isRequiresCommit()) {
            PersonIdent author = context.getAuthor();
            String message = context.getMessage();
            if (Strings.isBlank(message)) {
                message = "Updated " + Files.getRelativePath(rootDir, file);
            }
            CommitCommand command = git.commit().setAll(true).setMessage(message);
            if (author != null) {
                command = command.setAuthor(author);
            }
            RevCommit revCommit = commitThenPush(git, branch, command);
            createCommitInfo(revCommit);
        }
        return results;
    }

    protected FileInfo doExists(Git git, File rootDir, String branch, String pathOrEmpty) throws GitAPIException {
        return doExists(git, rootDir, branch, pathOrEmpty, false);
    }

    protected FileInfo doExists(Git git, File rootDir, String branch, String pathOrEmpty, final boolean caseSensitive) throws GitAPIException {
        checkoutBranch(git, branch);
        final String path = Strings.isBlank(pathOrEmpty) ? "/" : pathOrEmpty;

        File file = getFile(rootDir, path);
        File parent = file.getParentFile();

        // need to list the files, so we can grab the actual file name
        File[] files = parent.listFiles(new FileFilter() {
            String match = new File(caseSensitive ? path : path.toLowerCase(Locale.US)).getName();
            @Override
            public boolean accept(File pathname) {
                String name = caseSensitive ? pathname.getName() : pathname.getName().toLowerCase(Locale.US);
                return match.equals(name);
            }
        });

        if (files != null && files.length == 1) {
            return FileInfo.createFileInfo(rootDir, files[0], branch);
        }

        return null;
    }

    protected List<String> doCompletePath(Git git, File rootDir, String branch, String completionText, boolean directoriesOnly) throws GitAPIException {
        checkoutBranch(git, branch);
        boolean empty = Strings.isBlank(completionText);
        String pattern = completionText;
        File file = getFile(rootDir, completionText);
        String prefix = completionText;
        if (file.exists()) {
            pattern = "";
        } else {
            String startPath = ".";
            if (!empty) {
                int idx = completionText.lastIndexOf('/');
                if (idx >= 0) {
                    startPath = completionText.substring(0, idx);
                    if (startPath.length() == 0) {
                        startPath = "/";
                    }
                    pattern = completionText.substring(idx + 1);
                }
            }
            file = getFile(rootDir, startPath);
            prefix = startPath;
        }
        if (prefix.length() > 0 && !prefix.endsWith("/")) {
            prefix += "/";
        }
        if (prefix.equals("./")) {
            prefix = "";
        }
        File[] list = file.listFiles();
        List<String> answer = new ArrayList<String>();
        for (File aFile : list) {
            String name = aFile.getName();
            if (pattern.length() == 0 || name.contains(pattern)) {
                if (!isIgnoreFile(aFile) && (!directoriesOnly || aFile.isDirectory())) {
                    answer.add(prefix + name);
                }
            }
        }
        return answer;
    }

    protected String doReadJsonChildContent(Git git, File rootDir, String branch, String path, String fileNameWildcard, String search) throws GitAPIException, IOException {
        checkoutBranch(git, branch);
        File file = getFile(rootDir, path);
        FileFilter filter = FileFilters.createFileFilter(fileNameWildcard);
        boolean first = true;
        StringBuilder buffer = new StringBuilder("{\n");
        List<FileInfo> children = new ArrayList<FileInfo>();
        if (file.isDirectory()) {
            if (file.exists()) {
                File[] files = file.listFiles();
                for (File child : files) {
                    if (!isIgnoreFile(child) && child.isFile()) {
                        String text = IOHelper.readFully(child);
                        if (!Strings.isNotBlank(search) || text.contains(search)) {
                            if (first) {
                                first = false;
                            } else {
                                buffer.append(",\n");
                            }
                            buffer.append("\"");
                            buffer.append(child.getName());
                            buffer.append("\": ");
                            buffer.append(text);
                            children.add(FileInfo.createFileInfo(rootDir, child, branch));
                        }
                    }
                }
            }
        }
        buffer.append("\n}");
        return buffer.toString();
    }

    protected CommitInfo doWrite(Git git, File rootDir, String branch, String path, byte[] contents, PersonIdent personIdent, String commitMessage) throws Exception {
        File file = getFile(rootDir, path);
        file.getParentFile().mkdirs();

        IOHelper.write(file, contents);

        String filePattern = getFilePattern(path);
        AddCommand add = git.add().addFilepattern(filePattern).addFilepattern(".");
        add.call();

        CommitCommand commit = git.commit().setAll(true).setAuthor(personIdent).setMessage(commitMessage);
        RevCommit revCommit = commitThenPush(git, branch, commit);
        return createCommitInfo(revCommit);
    }

    protected static String getFilePattern(String path) {
        String filePattern = path;
        if (filePattern.startsWith("/")) filePattern = filePattern.substring(1);
        return filePattern;
    }

    protected RevCommit commitThenPush(Git git, String branch, CommitCommand commit) throws Exception {
        RevCommit answer = commit.call();
        if (LOG.isDebugEnabled()) {
            LOG.debug("Committed " + answer.getId() + " " + answer.getFullMessage());
        }
        if (isPushOnCommit()) {
            Iterable<PushResult> results = doPush(git);
            for (PushResult result : results) {
                if (LOG.isDebugEnabled()) {
                    LOG.debug("Pushed " + result.getMessages() + " " + result.getURI() + " branch: " + branch  +  " updates: " + toString(result.getRemoteUpdates()));
                }
            }
        }
        return answer;
    }

    protected String toString(Collection<RemoteRefUpdate> updates) {
        StringBuilder builder = new StringBuilder();
        for (RemoteRefUpdate update : updates) {
            if (builder.length() > 0) {
                builder.append(" ");
            }
            builder.append(update.getMessage() + " " + update.getRemoteName() + " " + update.getNewObjectId());
        }
        return builder.toString();
    }

    public CommitInfo createCommitInfo(RevCommit entry) {
        final Date date = GitFacade.getCommitDate(entry);
        String author = entry.getAuthorIdent().getName();
        boolean merge = entry.getParentCount() > 1;
        String shortMessage = entry.getShortMessage();
        String trimmedMessage = Strings.trimString(shortMessage, 78);
        String name = entry.getName();
        String commitHashText = getShortCommitHash(name);
        return new CommitInfo(commitHashText, name, author, date, merge, trimmedMessage, shortMessage);
    }

    protected String getShortCommitHash(String name) {
        final int hashLen = shortCommitIdLength;
        return name.substring(0, hashLen);
    }

    protected String removeLeadingSlash(String path) {
        if (path.startsWith("/")) {
            return path.substring(1);
        } else {
            return path;
        }
    }

    protected boolean isIgnoreFile(File child) {
        return child.getName().startsWith(".");
    }

    /**
     * Returns the file for the given path relative to the git root directory
     */
    protected File getFile(File rootDir, String path) {
        return new File(rootDir, removeLeadingSlash(path));
    }
}
