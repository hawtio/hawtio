package io.hawt.git;

import io.hawt.config.ConfigFacade;
import io.hawt.util.FileFilters;
import io.hawt.util.IOHelper;
import io.hawt.util.MBeanSupport;
import io.hawt.util.Objects;
import io.hawt.util.Strings;
import org.eclipse.jgit.api.AddCommand;
import org.eclipse.jgit.api.CheckoutCommand;
import org.eclipse.jgit.api.CloneCommand;
import org.eclipse.jgit.api.CommitCommand;
import org.eclipse.jgit.api.CreateBranchCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.InitCommand;
import org.eclipse.jgit.api.ListBranchCommand;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.NoHeadException;
import org.eclipse.jgit.diff.DiffEntry;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.diff.RawTextComparator;
import org.eclipse.jgit.lib.PersonIdent;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.lib.StoredConfig;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.transport.CredentialsProvider;
import org.eclipse.jgit.transport.PushResult;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.SortedSet;
import java.util.Timer;
import java.util.TimerTask;
import java.util.TreeSet;
import java.util.concurrent.Callable;

/**
 * A git bean to create a local git repo for configuration data which if configured will push/pull
 * from some central repo
 */
public class GitFacade extends MBeanSupport implements GitFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(GitFacade.class);

    private String configDirName;
    private File configDirectory;
    private String remoteRepository;
    private Git git;
    private Object lock = new Object();
    private int shortCommitIdLength = 6;
    private String remote = "origin";
    private String defaultRemoteRepository = "https://github.com/hawtio/hawtio-config.git";
    private boolean cloneRemoteRepoOnStartup = true;
    private boolean pullOnStartup = true;
    private CredentialsProvider credentials;
    private boolean cloneAllBranches = false;
    private boolean pushOnCommit = false;
    private boolean pullBeforeOperation = false;
    private long pullTimePeriod;
    private Timer timer;
    private TimerTask task;
    private PersonIdent stashPersonIdent;
    private String defaultBranch;


    public void init() throws Exception {
        // lets check if we have a config directory if not lets create one...
        initialiseGitRepo();

        long timePeriod = getPullTimePeriod();
        if (timePeriod > 0 && isPullBeforeOperation()) {
            Timer t = getTimer();
            if (t == null) {
                t = new Timer();
                setTimer(t);
            }
            final Callable<Object> emptyCallable = new Callable<Object>() {
                @Override
                public Object call() throws Exception {
                    if (LOG.isDebugEnabled()) {
                        LOG.debug("Pulled from remote repository " + getRemoteRepository());
                    }
                    return null;
                }
            };
            task = new TimerTask() {
                @Override
                public void run() {
                    gitOperation(getStashPersonIdent(), emptyCallable);
                }
            };
            t.schedule(task, timePeriod, timePeriod);
        }
        super.init();
    }

    @Override
    public void destroy() throws Exception {
        if (task != null) {
            task.cancel();
        }
        super.destroy();
    }

    public PersonIdent getStashPersonIdent() {
        if (stashPersonIdent == null) {
            stashPersonIdent = new PersonIdent("dummy", "dummy");
        }
        return stashPersonIdent;
    }

    public void setStashPersonIdent(PersonIdent stashPersonIdent) {
        this.stashPersonIdent = stashPersonIdent;
    }

    @Override
    protected String getDefaultObjectName() {
        return "io.hawt.git:type=GitFacade";
    }

    public String getRemoteRepository() {
        if (remoteRepository == null) {
            remoteRepository = defaultRemoteRepository;
        }
        return remoteRepository;
    }

    public void setRemoteRepository(String remoteRepository) {
        this.remoteRepository = remoteRepository;
        if (git != null && Strings.isNotBlank(remoteRepository)) {
            Repository repository = git.getRepository();
            if (repository != null) {
                StoredConfig config = repository.getConfig();
                String origin = getRemote();
                config.setString("remote", origin, "url", remoteRepository);
                config.setString("remote", origin, "fetch", "+refs/heads/*:refs/remotes/" + origin + "/*");
                try {
                    config.save();
                } catch (IOException e) {
                    LOG.error("Failed to save the git configuration to " + getConfigDirName() + " with remote repo: " + remoteRepository + ". " + e, e);
                }
            }
        }
    }

    public String getRemote() {
        return remote;
    }

    public void setRemote(String remote) {
        this.remote = remote;
    }

    public String getConfigDirName() {
        return configDirName;
    }

    public void setConfigDirName(String configDirName) {
        this.configDirName = configDirName;
    }

    public String getDefaultRemoteRepository() {
        return defaultRemoteRepository;
    }

    public void setDefaultRemoteRepository(String defaultRemoteRepository) {
        this.defaultRemoteRepository = defaultRemoteRepository;
    }

    public boolean isPullOnStartup() {
        return pullOnStartup;
    }

    public void setPullOnStartup(boolean pullOnStartup) {
        this.pullOnStartup = pullOnStartup;
    }

    public boolean isCloneAllBranches() {
        return cloneAllBranches;
    }

    public void setCloneAllBranches(boolean cloneAllBranches) {
        this.cloneAllBranches = cloneAllBranches;
    }

    public boolean isPushOnCommit() {
        return pushOnCommit;
    }

    public void setPushOnCommit(boolean pushOnCommit) {
        this.pushOnCommit = pushOnCommit;
    }

    public boolean isPullBeforeOperation() {
        return pullBeforeOperation;
    }

    public void setPullBeforeOperation(boolean pullBeforeOperation) {
        this.pullBeforeOperation = pullBeforeOperation;
    }

    public boolean isCloneRemoteRepoOnStartup() {
        return cloneRemoteRepoOnStartup;
    }

    public void setCloneRemoteRepoOnStartup(boolean cloneRemoteRepoOnStartup) {
        this.cloneRemoteRepoOnStartup = cloneRemoteRepoOnStartup;
    }

    public CredentialsProvider getCredentials() {
        return credentials;
    }

    public void setCredentials(CredentialsProvider credentials) {
        this.credentials = credentials;
    }

    public long getPullTimePeriod() {
        return pullTimePeriod;
    }

    public void setPullTimePeriod(long pullTimePeriod) {
        this.pullTimePeriod = pullTimePeriod;
    }

    public Timer getTimer() {
        return timer;
    }

    public void setTimer(Timer timer) {
        this.timer = timer;
    }

    /**
     * Defaults to the current branch on disk if not explicitly configured
     */
    public String getDefaultBranch() {
        return defaultBranch;
    }

    public void setDefaultBranch(String defaultBranch) {
        this.defaultBranch = defaultBranch;
    }

    @Override
    public String getContent(String objectId, String blobPath) {
        objectId = defaultObjectId(objectId);
        Repository r = git.getRepository();
        return BlobUtils.getContent(r, objectId, blobPath);
    }

    /**
     * Reads the file contents of the given path
     *
     * @return
     */
    public FileContents read(final String branch, String pathOrEmpty) throws IOException, GitAPIException {
        final String path = Strings.isBlank(pathOrEmpty) ? "/" : pathOrEmpty;
        return gitOperation(getStashPersonIdent(), new Callable<FileContents>() {
            @Override
            public FileContents call() throws Exception {
                File rootDir = getConfigDirectory();
                checkoutBranch(branch);
                File file = getFile(path);
                if (file.isFile()) {
                    String contents = IOHelper.readFully(file);
                    return new FileContents(false, contents, null);
                } else {
                    List<FileInfo> children = new ArrayList<FileInfo>();
                    if (file.exists()) {
                        File[] files = file.listFiles();
                        for (File child : files) {
                            if (!isIgnoreFile(child)) {
                                children.add(FileInfo.createFileInfo(rootDir, child));
                            }
                        }
                    }
                    return new FileContents(file.isDirectory(), null, children);
                }
            }
        });
    }

    protected boolean isIgnoreFile(File child) {
        return child.getName().startsWith(".");
    }

    /**
     * Reads the child JSON file contents which match the given search string (if specified) and which match the given file name wildcard (using * to match any characters in the name).
     */
    @Override
    public String readJsonChildContent(final String branch, final String path, String fileNameWildcardOrBlank, final String search) throws IOException {
        final String fileNameWildcard = (Strings.isBlank(fileNameWildcardOrBlank)) ? "*.json" : fileNameWildcardOrBlank;
        return gitOperation(getStashPersonIdent(), new Callable<String>() {
            @Override
            public String call() throws Exception {
                File rootDir = getConfigDirectory();
                File file = getFile(path);
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
                                    children.add(FileInfo.createFileInfo(rootDir, child));
                                }
                            }
                        }
                    }
                }
                buffer.append("\n}");
                return buffer.toString();
            }
        });
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
                return commitThenPush(commit);
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
                    return commitThenPush(commit);
                } else {
                    return null;
                }
            }
        });
    }

    @Override
    public List<String> branches() {
        return gitOperation(getStashPersonIdent(), new Callable<List<String>>() {
            @Override
            public List<String> call() throws Exception {
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
        });
    }

    protected RevCommit commitThenPush(CommitCommand commit) throws GitAPIException {
        RevCommit answer = commit.call();
        LOG.info("Committed " + answer);
        if (isPushOnCommit()) {
            Iterable<PushResult> results = git.push().setCredentialsProvider(getCredentials()).setRemote(getRemote()).call();
            for (PushResult result : results) {
                LOG.info("Pushed: " + results);
            }
        }
        return answer;
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
            if (Strings.isNotBlank(path)) {
                finder.setFilter(PathFilterUtils.and(path));
            }
            finder.setFilter(block);

            if (limit > 0) {
                finder.setFilter(new CommitLimitFilter(100).setStop(true));
            }
            if (Strings.isNotBlank(objectId)) {
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
                String trimmedMessage = Strings.trimString(shortMessage, 78);
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
                String name = getConfigDirName();
                if (Strings.isNotBlank(name)) {
                    configDirectory = new File(name);
                } else {
                    ConfigFacade singleton = ConfigFacade.getSingleton();
                    if (singleton != null) {
                        File hawtioConfigDir = singleton.getConfigDirectory();
                        if (hawtioConfigDir.exists()) {
                            configDirectory = new File(hawtioConfigDir, "config");
                        }
                    }
                    if (configDirectory == null) {
                        File file = File.createTempFile("hawtio-", "");
                        file.delete();
                        configDirectory = new File(file, "config");
                        configDirectory.mkdirs();
                    }
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
            String repo = getRemoteRepository();
            if (Strings.isNotBlank(repo) && isCloneRemoteRepoOnStartup()) {
                boolean cloneAll = isCloneAllBranches();
                LOG.info("Cloning git repo " + repo + " into directory " + confDir.getCanonicalPath() + " cloneAllBranches: " + cloneAll);
                CloneCommand command = Git.cloneRepository().setCredentialsProvider(getCredentials()).
                        setCloneAllBranches(cloneAll).setURI(repo).setDirectory(confDir).setRemote(remote);
                try {
                    git = command.call();
                    return;
                } catch (Throwable e) {
                    LOG.error("Failed to command remote repo " + repo + ". Reason: " + e, e);
                    // lets just use an empty repo instead
                }
            } else if (!isCloneRemoteRepoOnStartup()) {
                LOG.info("Clone git repo on startup disabled");
            }
            InitCommand initCommand = Git.init();
            initCommand.setDirectory(confDir);
            git = initCommand.call();
            LOG.info("Initialised an empty git configuration repo at " + confDir.getCanonicalPath());

            String branch = git.getRepository().getBranch();
            configureBranch(branch);
        } else {
            Repository repository = builder.setGitDir(gitDir)
                    .readEnvironment() // scan environment GIT_* variables
                    .findGitDir() // scan up the file system tree
                    .build();

            git = new Git(repository);

            if (isPullOnStartup()) {
                doPull();
            } else {
                LOG.info("git pull from remote config repo on startup is disabled");
            }
        }
    }

    protected void doPull() {
        CredentialsProvider cp = getCredentials();
        try {
            git.pull().setCredentialsProvider(cp).setRebase(true).call();
            if (LOG.isDebugEnabled()) {
                LOG.debug("Performed a git pull to update the local configuration repository at " + getConfigDirectory().getCanonicalPath());
            }
        } catch (Throwable e) {
            String credText = "";
            if (cp instanceof UsernamePasswordCredentialsProvider) {

            }
            LOG.error("Failed to pull from the remote git repo with credentials " + cp + ". Reason: " + e, e);
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

                if (hasHead) {
                    // lets stash any local changes just in case..
                    git.stashCreate().setPerson(personIdent).setWorkingDirectoryMessage("Stash before a write").setRef("HEAD").call();
                }
                if (isPullBeforeOperation() && Strings.isNotBlank(getRemoteRepository())) {
                    doPull();
                }
                return callable.call();
            } catch (Exception e) {
                throw new RuntimeIOException(e);
            }
        }
    }

    public String currentBranch() {
        try {
            return git.getRepository().getBranch();
        } catch (IOException e) {
            LOG.warn("Failed to get the current branch: " + e, e);
            return null;
        }
    }

    protected void checkoutBranch(String branch) throws GitAPIException {
        String current = currentBranch();
        if (defaultBranch == null) {
            defaultBranch = current;
        }
        if (Strings.isBlank(branch)) {
            branch = defaultBranch;
        }
        if (Objects.equals(current, branch)) {
            return;
        }
        // lets check if the branch exists
        CheckoutCommand command = git.checkout().setName(branch);
        boolean exists = localBranchExists(branch);
        if (!exists) {
            command = command.setCreateBranch(true).setForce(true).
                    setUpstreamMode(CreateBranchCommand.SetupUpstreamMode.TRACK).
                    setStartPoint(getRemote() + "/" + branch);
        }
        Ref ref = command.call();
        if (LOG.isDebugEnabled()) {
            LOG.debug("Checked out branch " + branch + " with results " + ref.getName());
        }
        configureBranch(branch);
    }

    protected void configureBranch(String branch) {
        // lets update the merge config
        if (Strings.isNotBlank(branch)) {
            StoredConfig config = git.getRepository().getConfig();
            if (Strings.isBlank(config.getString("branch", branch, "remote")) || Strings.isBlank(config.getString("branch", branch, "merge"))) {
                config.setString("branch", branch, "remote", getRemote());
                config.setString("branch", branch, "merge", "refs/heads/" + branch);
                try {
                    config.save();
                } catch (IOException e) {
                    LOG.error("Failed to save the git configuration to " + getConfigDirName()
                            + " with branch " + branch + " on remote repo: " + remoteRepository + ". " + e, e);
                }
            }
        }
    }

    protected boolean localBranchExists(String branch) throws GitAPIException {
        List<Ref> list = git.branchList().call();
        String fullName = "refs/heads/" + branch;
        boolean localBranchExists = false;
        for (Ref ref : list) {
            String name = ref.getName();
            if (Objects.equals(name, fullName)) {
                localBranchExists = true;
            }
        }
        return localBranchExists;
    }

}