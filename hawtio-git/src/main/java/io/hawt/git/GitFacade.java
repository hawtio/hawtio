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

import com.gitblit.Constants;
import com.gitblit.models.PathModel;
import com.gitblit.models.RefModel;
import com.gitblit.models.SubmoduleModel;
import com.gitblit.utils.DiffUtils;
import com.gitblit.utils.JGitUtils;
import com.gitblit.utils.StringUtils;
import io.hawt.io.IOHelper;
import org.eclipse.jgit.api.AddCommand;
import org.eclipse.jgit.api.CommitCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.InitCommand;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.NoHeadException;
import org.eclipse.jgit.diff.DiffEntry.ChangeType;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.PersonIdent;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.treewalk.filter.PathFilterGroup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.io.File;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;

/**
 * A git bean to create a local git repo for configuration data which if configured will push/pull
 * from some central repo
 */
public class GitFacade implements GitFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(GitFacade.class);

    private File configDirectory;
    private Git git;
    private Object lock = new Object();
    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private int shortCommitIdLength = 6;
    private List<String> submoduleUrlPatterns = new ArrayList<String>(Arrays.asList(".*?://github.com/(.*)"));
    private String[] encodings = {"UTF-8", "ISO-8859-1"};


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

    public ObjectName getObjectName() {
        return objectName;
    }

    public void setObjectName(ObjectName objectName) {
        this.objectName = objectName;
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
        return JGitUtils.getHEADRef(git.getRepository());
    }

    @Override
    public List<CommitInfo> history(String objectId, String path, int limit, int pageOffset, boolean showRemoteRefs, int itemsPerPage) {
        try {
            if (itemsPerPage <= 1) {
                itemsPerPage = 50;
            }
            boolean pageResults = limit <= 0;
            Repository r = git.getRepository();

            // TODO not sure if this is the right String we should use for the sub module stuff...
            String repositoryName = getConfigDirectory().getPath();

            objectId = defaultObjectId(objectId);
            RevCommit commit = JGitUtils.getCommit(r, objectId);
            List<PathModel.PathChangeModel> paths = JGitUtils.getFilesInCommit(r, commit);

            Map<String, SubmoduleModel> submodules = new HashMap<String, SubmoduleModel>();
            for (SubmoduleModel model : JGitUtils.getSubmodules(r, commit.getTree())) {
                submodules.put(model.path, model);
            }

            PathModel matchingPath = null;
            for (PathModel p : paths) {
                if (p.path.equals(path)) {
                    matchingPath = p;
                    break;
                }
            }
            if (matchingPath == null) {
                // path not in commit
                // manually locate path in tree
                TreeWalk tw = new TreeWalk(r);
                tw.reset();
                tw.setRecursive(true);
                try {
                    tw.addTree(commit.getTree());
                    tw.setFilter(PathFilterGroup.createFromStrings(Collections.singleton(path)));
                    while (tw.next()) {
                        if (tw.getPathString().equals(path)) {
                            matchingPath = new PathModel.PathChangeModel(tw.getPathString(), tw.getPathString(), 0, tw
                                    .getRawMode(0), tw.getObjectId(0).getName(), commit.getId().getName(),
                                    ChangeType.MODIFY);
                        }
                    }
                } catch (Exception e) {
                } finally {
                    tw.release();
                }
            }

            final boolean isTree = matchingPath == null ? true : matchingPath.isTree();
            final boolean isSubmodule = matchingPath == null ? true : matchingPath.isSubmodule();

            // submodule
            SubmoduleModel submodule = null;
            if (matchingPath != null) {
                submodule = getSubmodule(submodules, repositoryName, matchingPath.path);
            }
            final String submodulePath;
            final boolean hasSubmodule;
            if (submodule != null) {
                submodulePath = submodule.gitblitPath;
                hasSubmodule = submodule.hasSubmodule;
            } else {
                submodulePath = "";
                hasSubmodule = false;
            }

            final Map<ObjectId, List<RefModel>> allRefs = JGitUtils.getAllRefs(r, showRemoteRefs);
            List<RevCommit> commits;
            if (pageResults) {
                // Paging result set
                commits = JGitUtils.getRevLog(r, objectId, path, pageOffset * itemsPerPage,
                        itemsPerPage);
            } else {
                // Fixed size result set
                commits = JGitUtils.getRevLog(r, objectId, path, 0, limit);
            }

            // inaccurate way to determine if there are more commits.
            // works unless commits.size() represents the exact end.
            boolean hasMore = commits.size() >= itemsPerPage;

            List<CommitInfo> results = new ArrayList<CommitInfo>();
            for (RevCommit entry : commits) {
                final Date date = JGitUtils.getCommitDate(entry);
                String author = entry.getAuthorIdent().getName();
                boolean merge = entry.getParentCount() > 1;

                String shortMessage = entry.getShortMessage();
                String trimmedMessage = shortMessage;
                if (allRefs.containsKey(entry.getId())) {
                    trimmedMessage = StringUtils.trimString(shortMessage, Constants.LEN_SHORTLOG_REFS);
                } else {
                    trimmedMessage = StringUtils.trimString(shortMessage, Constants.LEN_SHORTLOG);
                }
                String name = entry.getName();
                String commitHashText = getShortCommitHash(name);

                String kind;
                if (isTree) {
                    kind = "tree";
                } else if (isSubmodule) {
                    kind = "submodule";
                } else kind = "file";

                results.add(new CommitInfo(commitHashText, name, kind, author, date, merge, trimmedMessage, shortMessage));
            }
            return results;
        } catch (Exception e) {
            throw new RuntimeIOException(e);
        }
    }

    // Note the following log and history code comes from the excellent
    // gitblit project: http://gitblit.com/
    // many thanks!

    @Override
    public List<CommitInfo> log(String objectId,
                                final String path, int limit, int pageOffset, boolean showRemoteRefs, int itemsPerPage) {

        try {
            if (itemsPerPage <= 1) {
                itemsPerPage = 50;
            }
            boolean pageResults = limit <= 0;
            Repository r = git.getRepository();

            // TODO not sure if this is the right String we should use for the sub module stuff...
            String repositoryName = getConfigDirectory().getPath();

            objectId = defaultObjectId(objectId);

            final Map<ObjectId, List<RefModel>> allRefs = JGitUtils.getAllRefs(r, showRemoteRefs);
            List<RevCommit> commits;
            if (pageResults) {
                // Paging result set
                commits = JGitUtils.getRevLog(r, objectId, pageOffset * itemsPerPage, itemsPerPage);
            } else {
                // Fixed size result set
                commits = JGitUtils.getRevLog(r, objectId, 0, limit);
            }

            List<CommitInfo> answer = new ArrayList<CommitInfo>();
            for (RevCommit entry : commits) {
                final Date date = JGitUtils.getCommitDate(entry);
                String author = entry.getAuthorIdent().getName();
                boolean merge = entry.getParentCount() > 1;

                // short message
                String shortMessage = entry.getShortMessage();
                String trimmedMessage = shortMessage;
                if (allRefs.containsKey(entry.getId())) {
                    trimmedMessage = StringUtils.trimString(shortMessage, Constants.LEN_SHORTLOG_REFS);
                } else {
                    trimmedMessage = StringUtils.trimString(shortMessage, Constants.LEN_SHORTLOG);
                }

                String name = entry.getName();
                String commitHash = getShortCommitHash(name);
                answer.add(new CommitInfo(commitHash, name, "log", author, date, merge, trimmedMessage, shortMessage));
            }
            return answer;
        } catch (Exception e) {
            throw new RuntimeIOException(e);
        }
    }

    @Override
    public String diff(String objectId, String baseObjectId, String blobPath) {
        Repository r = git.getRepository();
        objectId = defaultObjectId(objectId);
        RevCommit commit = JGitUtils.getCommit(r, objectId);

        DiffUtils.DiffOutputType diffType = DiffUtils.DiffOutputType.PLAIN;
        String diff;
        if (StringUtils.isEmpty(baseObjectId)) {
            // use first parent
            diff = DiffUtils.getDiff(r, commit, blobPath, diffType);
        } else {
            // base commit specified
            RevCommit baseCommit = JGitUtils.getCommit(r, baseObjectId);
            diff = DiffUtils.getDiff(r, baseCommit, commit, blobPath, diffType);
        }
        return diff;
    }

    @Override
    public String getContent(String objectId, String blobPath) {
        objectId = defaultObjectId(objectId);
        Repository r = git.getRepository();
        RevCommit commit = JGitUtils.getCommit(r, objectId);
        return JGitUtils.getStringContent(r, commit.getTree(), blobPath, encodings);
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

    protected SubmoduleModel getSubmodule(Map<String, SubmoduleModel> submodules, String repositoryName, String path) {
        SubmoduleModel model = submodules.get(path);
        if (model == null) {
            // undefined submodule?!
            model = new SubmoduleModel(path.substring(path.lastIndexOf('/') + 1), path, path);
            model.hasSubmodule = false;
            model.gitblitPath = model.name;
            return model;
        } else {
            // extract the repository name from the clone url
            List<String> patterns = submoduleUrlPatterns;
            String submoduleName = StringUtils.extractRepositoryPath(model.url, patterns.toArray(new String[0]));

            // determine the current path for constructing paths relative
            // to the current repository
            String currentPath = "";
            if (repositoryName.indexOf('/') > -1) {
                currentPath = repositoryName.substring(0, repositoryName.lastIndexOf('/') + 1);
            }

            // try to locate the submodule repository
            // prefer bare to non-bare names
            List<String> candidates = new ArrayList<String>();

            // relative
            candidates.add(currentPath + StringUtils.stripDotGit(submoduleName));
            candidates.add(candidates.get(candidates.size() - 1) + ".git");

            // relative, no subfolder
            if (submoduleName.lastIndexOf('/') > -1) {
                String name = submoduleName.substring(submoduleName.lastIndexOf('/') + 1);
                candidates.add(currentPath + StringUtils.stripDotGit(name));
                candidates.add(currentPath + candidates.get(candidates.size() - 1) + ".git");
            }

            // absolute
            candidates.add(StringUtils.stripDotGit(submoduleName));
            candidates.add(candidates.get(candidates.size() - 1) + ".git");

            // absolute, no subfolder
            if (submoduleName.lastIndexOf('/') > -1) {
                String name = submoduleName.substring(submoduleName.lastIndexOf('/') + 1);
                candidates.add(StringUtils.stripDotGit(name));
                candidates.add(candidates.get(candidates.size() - 1) + ".git");
            }

            // create a unique, ordered set of candidate paths
            Set<String> paths = new LinkedHashSet<String>(candidates);
            for (String candidate : paths) {
    /*
                       if (GitBlit.self().hasRepository(candidate)) {
       					model.hasSubmodule = true;
       					model.gitblitPath = candidate;
       					return model;
       				}
    */
            }

            // we do not have a copy of the submodule, but we need a path
            model.gitblitPath = candidates.get(0);
            return model;
        }
    }

    public File getConfigDirectory() {
        if (configDirectory == null) {
            try {
                String name = System.getProperty("hawtio.config.dir");
                if (name == null) {
                    name = System.getenv("HAWTIO_CONFIG_DIR");
                }
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

    public void setConfigDirectory(File configDirectory) {
        this.configDirectory = configDirectory;
    }

    public void initialiseGitRepo() throws IOException, GitAPIException {
        File confDir = getConfigDirectory();
        FileRepositoryBuilder builder = new FileRepositoryBuilder();
        File gitDir = new File(confDir, ".git");
        if (!gitDir.exists()) {
            InitCommand initCommand = Git.init();
            initCommand.setDirectory(confDir);
            git = initCommand.call();
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