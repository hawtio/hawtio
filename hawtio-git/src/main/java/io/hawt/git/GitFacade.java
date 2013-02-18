/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.git;

import io.hawt.io.IOHelper;
import org.eclipse.jgit.api.AddCommand;
import org.eclipse.jgit.api.CloneCommand;
import org.eclipse.jgit.api.CommitCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.InitCommand;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.NoHeadException;
import org.eclipse.jgit.diff.DiffEntry;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.diff.RawTextComparator;
import org.eclipse.jgit.lib.PersonIdent;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.gitective.core.BlobUtils;
import org.gitective.core.CommitFinder;
import org.gitective.core.CommitUtils;
import org.gitective.core.PathFilterUtils;
import org.gitective.core.filter.commit.CommitLimitFilter;
import org.gitective.core.filter.commit.CommitListFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * A git bean to create a local git repo for configuration data which if configured will push/pull
 * from some central repo
 */
public class GitFacade implements GitFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(GitFacade.class);

    private File configDirectory;
    private String remoteRepository;
    private Git git;
    private Object lock = new Object();
    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private int shortCommitIdLength = 6;
    private String remote = "origin";
    private String defaultRemoteRepository;


    public void init() throws Exception {
        // lets check if we have a config directory if not lets create one...
        initialiseGitRepo();

        // now lets expose the mbean...
        if (objectName == null) {
            objectName = new ObjectName("io.hawt.git:type=GitFacade");
        }
        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }
        mBeanServer.registerMBean(this, objectName);
    }

    public void destroy() throws Exception {
        if (objectName != null && mBeanServer != null) {
            mBeanServer.unregisterMBean(objectName);
        }
    }

    public String getRemoteRepository() {
        if (remoteRepository == null) {
            remoteRepository = getSystemPropertyOrEnvironmentVariable("hawtio.config.repo", "HAWTIO_CONFIG_REPO");
        }
        if (remoteRepository == null) {
            remoteRepository = defaultRemoteRepository;
        }
        return remoteRepository;
    }

    public void setRemoteRepository(String remoteRepository) {
        this.remoteRepository = remoteRepository;
    }

    public String getRemote() {
        return remote;
    }

    public void setRemote(String remote) {
        this.remote = remote;
    }

    public MBeanServer getmBeanServer() {
        return mBeanServer;
    }

    public void setmBeanServer(MBeanServer mBeanServer) {
        this.mBeanServer = mBeanServer;
    }

    public ObjectName getObjectName() {
        return objectName;
    }

    public void setObjectName(ObjectName objectName) {
        this.objectName = objectName;
    }

    public String getDefaultRemoteRepository() {
        return defaultRemoteRepository;
    }

    public void setDefaultRemoteRepository(String defaultRemoteRepository) {
        this.defaultRemoteRepository = defaultRemoteRepository;
    }

    /**
     * Reads the file contents of the given path
     *
     * @return
     */
    public FileContents read(String branch, String path) throws IOException {
        File rootDir = getConfigDirectory();
        File file = getFile(path);
        if (file.isFile()) {
            String contents = IOHelper.readFully(file);
            return new FileContents(false, contents, null);
        } else {
            List<FileInfo> children = new ArrayList<FileInfo>();
            if (file.exists()) {
                File[] files = file.listFiles();
                for (File child : files) {
                    if (!child.getName().equals(".git")) {
                        children.add(FileInfo.createFileInfo(rootDir, child));
                    }
                }
            }
            return new FileContents(file.isDirectory(), null, children);
        }
    }


    public void write(final String branch, final String path, final String commitMessage,
                      final String authorName, final String authorEmail, final String contents) {
        final PersonIdent personIdent = new PersonIdent(authorName, authorEmail);
        gitOperation(personIdent, new Callable<RevCommit>() {
            public RevCommit call() throws Exception {
                File file = getFile(path);
                file.getParentFile().mkdirs();

                IOHelper.write(file, contents);

                String filePattern = getFilePattern(path);
                AddCommand add = git.add().addFilepattern(filePattern).addFilepattern(".");
                add.call();

                CommitCommand commit = git.commit().setAll(true).setAuthor(personIdent).setMessage(commitMessage);
                return commit.call();
            }
        });
    }

    @Override
    public void revertTo(final String branch, final String objectId, final String blobPath, final String commitMessage,
                         final String authorName, final String authorEmail) {
        String contents = getContent(objectId, blobPath);
        if (contents != null) {
            write(branch, blobPath, commitMessage, authorName, authorEmail, contents);
        }
    }

    protected static String getFilePattern(String path) {
        String filePattern = path;
        if (filePattern.startsWith("/")) filePattern = filePattern.substring(1);
        return filePattern;
    }

    public void move(String branch, String oldPath, String newPath) {
        // TODO
    }

    public void remove(final String branch, final String path, final String commitMessage,
                       final String authorName, final String authorEmail) {
        final PersonIdent personIdent = new PersonIdent(authorName, authorEmail);
        gitOperation(personIdent, new Callable<RevCommit>() {
            public RevCommit call() throws Exception {
                File file = getFile(path);

                if (file.exists()) {
                    file.delete();

                    String filePattern = getFilePattern(path);
                    git.rm().addFilepattern(filePattern).call();
                    CommitCommand commit = git.commit().setAll(true).setAuthor(personIdent).setMessage(commitMessage);
                    return commit.call();
                } else {
                    return null;
                }
            }
        });
    }

    @Override
    public String getHEAD() {
        RevCommit commit = CommitUtils.getHead(git.getRepository());
        return commit.getName();
    }

    @Override
    public List<CommitInfo> history(String objectId, String path, int limit) {
        try {
            Repository r = git.getRepository();

            CommitFinder finder = new CommitFinder(r);
            CommitListFilter block = new CommitListFilter();
            if (isNotBlank(path)) {
                finder.setFilter(PathFilterUtils.and(path));
            }
            finder.setFilter(block);

            if (limit > 0) {
                finder.setFilter(new CommitLimitFilter(100).setStop(true));
            }
            if (isNotBlank(objectId)) {
                finder.findFrom(objectId);
            } else {
                finder.find();
            }
            List<RevCommit> commits = block.getCommits();
            List<CommitInfo> results = new ArrayList<CommitInfo>();
            for (RevCommit entry : commits) {
                final Date date = getCommitDate(entry);
                String author = entry.getAuthorIdent().getName();
                boolean merge = entry.getParentCount() > 1;
                String shortMessage = entry.getShortMessage();
                String trimmedMessage = trimString(shortMessage, 78);
                String name = entry.getName();
                String commitHashText = getShortCommitHash(name);
                results.add(new CommitInfo(commitHashText, name, author, date, merge, trimmedMessage, shortMessage));
            }
            return results;
        } catch (Exception e) {
            throw new RuntimeIOException(e);
        }
    }

    /**
     * Retrieves a Java Date from a Git commit.
     *
     * @param commit
     * @return date of the commit or Date(0) if the commit is null
     */
    public static Date getCommitDate(RevCommit commit) {
        if (commit == null) {
            return new Date(0);
        }
        return new Date(commit.getCommitTime() * 1000L);
    }

    public static String trimString(String value, int max) {
        if (value == null) {
            return "";
        }
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max - 3) + "...";
    }

    public static boolean isNotBlank(String text) {
        return text != null && text.trim().length() > 0;
    }

    @Override
    public String diff(String objectId, String baseObjectId, String path) {
        Repository r = git.getRepository();
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
        if (isNotBlank(objectId)) {
            commit = CommitUtils.getCommit(r, objectId);
        } else {
            commit = CommitUtils.getHead(r);
        }
        RevCommit baseCommit = null;
        if (isNotBlank(baseObjectId)) {
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
            if (path != null && path.length() > 0) {
                for (DiffEntry diffEntry : diffEntries) {
                    if (diffEntry.getNewPath().equalsIgnoreCase(path)) {
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

    @Override
    public String getContent(String objectId, String blobPath) {
        objectId = defaultObjectId(objectId);
        Repository r = git.getRepository();
        return BlobUtils.getContent(r, objectId, blobPath);
    }

    protected String defaultObjectId(String objectId) {
        if (objectId == null || objectId.trim().length() == 0) {
            objectId = getHEAD();
        }
        return objectId;
    }

    protected String getShortCommitHash(String name) {
        final int hashLen = shortCommitIdLength;
        return name.substring(0, hashLen);
    }

    public File getConfigDirectory() {
        if (configDirectory == null) {
            try {
                String name = getSystemPropertyOrEnvironmentVariable("hawtio.config.dir", "HAWTIO_CONFIG_DIR");
                if (name != null) {
                    configDirectory = new File(name);
                } else {
                    File file = File.createTempFile("hawtio-", "");
                    file.delete();
                    configDirectory = new File(file, "config");
                    configDirectory.mkdirs();
                }
                LOG.info("hawtio using config directory: " + configDirectory);
            } catch (IOException e) {
                throw new RuntimeIOException(e);
            }
        }
        return configDirectory;
    }

    public String getSystemPropertyOrEnvironmentVariable(String systemPropertyName, String environmentVariableName) {
        String name = System.getProperty(systemPropertyName);
        if (name == null) {
            name = System.getenv(environmentVariableName);
        }
        return name;
    }

    public void setConfigDirectory(File configDirectory) {
        this.configDirectory = configDirectory;
    }

    public void initialiseGitRepo() throws IOException, GitAPIException {
        File confDir = getConfigDirectory();
        FileRepositoryBuilder builder = new FileRepositoryBuilder();
        File gitDir = new File(confDir, ".git");
        if (!gitDir.exists()) {
            String repo = getRemoteRepository();
            if (isNotBlank(repo)) {
                LOG.info("Cloning git repo " + repo);
                CloneCommand clone = Git.cloneRepository().setURI(repo).setDirectory(confDir).setRemote(remote);
                git = clone.call();
            } else {
                InitCommand initCommand = Git.init();
                initCommand.setDirectory(confDir);
                git = initCommand.call();
            }
        } else {
            Repository repository = builder.setGitDir(gitDir)
                    .readEnvironment() // scan environment GIT_* variables
                    .findGitDir() // scan up the file system tree
                    .build();

            git = new Git(repository);
        }
    }


    /**
     * Returns the file for the given path
     */
    public File getFile(String path) {
        File rootDir = getConfigDirectory();
        return new File(rootDir, path);
    }


    public Status status() {
        try {
            return git.status().call();
        } catch (GitAPIException e) {
            throw new RuntimeIOException(e);
        }

    }

    /**
     * Performs the given operations on a clean git repository
     */
    protected <T> T gitOperation(PersonIdent personIdent, Callable<T> callable) {
        synchronized (lock) {
            try {
                // lets check if we have done a commit yet...
                boolean hasHead = true;
                try {
                    git.log().all().call();
                } catch (NoHeadException e) {
                    hasHead = false;
                }

                // TODO pull if we have a remote repo

                if (hasHead) {
                    // lets stash any local changes just in case..
                    git.stashCreate().setPerson(personIdent).setWorkingDirectoryMessage("Stash before a write").setRef("HEAD").call();
                }
                return callable.call();
            } catch (Exception e) {
                throw new RuntimeIOException(e);
            }
        }
    }

}