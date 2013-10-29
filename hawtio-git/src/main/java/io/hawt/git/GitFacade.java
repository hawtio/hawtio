package io.hawt.git;

import io.hawt.config.ConfigFacade;
import io.hawt.util.Objects;
import io.hawt.util.Strings;
import org.eclipse.jgit.api.CheckoutCommand;
import org.eclipse.jgit.api.CloneCommand;
import org.eclipse.jgit.api.CreateBranchCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.InitCommand;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.NoHeadException;
import org.eclipse.jgit.lib.PersonIdent;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.lib.StoredConfig;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.transport.CredentialsProvider;
import org.eclipse.jgit.transport.PushResult;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.Callable;

/**
 * A git bean to create a local git repo for configuration data which if configured will push/pull
 * from some central repo
 */
public class GitFacade extends GitFacadeSupport {
    private static final transient Logger LOG = LoggerFactory.getLogger(GitFacade.class);

    private String configDirName;
    private File configDirectory;
    private String remoteRepository;
    private Git git;
    private final Object lock = new Object();
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
    private boolean firstPull = true;


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
                        LOG.debug("Pulled from remote repository {}", getRemoteRepository());
                    }
                    return null;
                }
            };
            task = new TimerTask() {
                @Override
                public void run() {
                    try {
                        gitOperation(getStashPersonIdent(), emptyCallable);
                    } catch (Exception e) {
                        LOG.warn("Failed to pull from remote repo due " + e.getMessage() + ". This exception is ignored.", e);
                    }
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
                    LOG.error("Failed to save the git configuration to " + getConfigDirName() + " with remote repo: " + remoteRepository
                            + " due: " + e.getMessage() + ". This exception is ignored.", e);
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
        return doGetContent(git, objectId, blobPath);
    }

    /**
     * Reads the file contents of the given path
     */
    public FileContents read(final String branch, final String pathOrEmpty) throws IOException, GitAPIException {
        return gitOperation(getStashPersonIdent(), new Callable<FileContents>() {
            @Override
            public FileContents call() throws Exception {
                return doRead(git, getRootGitDirectory(), branch, pathOrEmpty);
            }
        });
    }

    /**
     * Checks if the file exists at the given path and returns the file metadata or null if it does not exist
     *
     * @return the metadata for the given file or null if it does not exist
     */
    @Override
    public FileInfo exists(final String branch, final String pathOrEmpty) throws IOException, GitAPIException {
        return gitOperation(getStashPersonIdent(), new Callable<FileInfo>() {
            @Override
            public FileInfo call() throws Exception {
                File rootDir = getRootGitDirectory();
                return doExists(git, rootDir, branch, pathOrEmpty);
            }
        });
    }

    /**
     * Provides a file/path completion hook so we can start typing the name of a file or directory
     */
    public List<String> completePath(final String branch, final String completionText, final boolean directoriesOnly) {
        return gitOperation(getStashPersonIdent(), new Callable<List<String>>() {
            @Override
            public List<String> call() throws Exception {
                File rootDir = getRootGitDirectory();
                return doCompletePath(git, rootDir, branch, completionText, directoriesOnly);
            }
        });
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
                File rootDir = getRootGitDirectory();
                return doReadJsonChildContent(git, rootDir, branch, path, fileNameWildcard, search);
            }
        });
    }

    public CommitInfo write(final String branch, final String path, final String commitMessage,
                      final String authorName, final String authorEmail, final String contents) {
        final PersonIdent personIdent = new PersonIdent(authorName, authorEmail);
        return gitOperation(personIdent, new Callable<CommitInfo>() {
            public CommitInfo call() throws Exception {
                checkoutBranch(git, branch);
                File rootDir = getRootGitDirectory();
                return doWrite(git, rootDir, branch, path, contents, personIdent, commitMessage);
            }
        });
    }

    /**
     * Creates a new file if it doesn't already exist
     *
     * @return the commit metadata for the newly created file or null if it already exists
     */
    @Override
    public CommitInfo createDirectory(final String branch, final String path, final String commitMessage,
                                     final String authorName, final String authorEmail) {
        final PersonIdent personIdent = new PersonIdent(authorName, authorEmail);
        return gitOperation(personIdent, new Callable<CommitInfo>() {
            public CommitInfo call() throws Exception {
                checkoutBranch(git, branch);
                File rootDir = getRootGitDirectory();
                return doCreateDirectory(git, rootDir, branch, path, personIdent, commitMessage);
            }
        });
    }

    @Override
    public void revertTo(final String branch, final String objectId, final String blobPath, final String commitMessage,
                         final String authorName, final String authorEmail) {
        final PersonIdent personIdent = new PersonIdent(authorName, authorEmail);
        gitOperation(personIdent, new Callable<Void>() {
            @Override
            public Void call() throws Exception {
                Git aGit = git;
                File rootDir = getRootGitDirectory();
                return doRevert(aGit, rootDir, branch, objectId, blobPath, commitMessage, personIdent);
            }
        });
    }

    public void rename(final String branch, final String oldPath, final String newPath, final String commitMessage,
                       final String authorName, final String authorEmail) {
        final PersonIdent personIdent = new PersonIdent(authorName, authorEmail);
        gitOperation(personIdent, new Callable<RevCommit>() {
            public RevCommit call() throws Exception {
                File rootDir = getRootGitDirectory();
                return doRename(git, rootDir, branch, oldPath, newPath, commitMessage, personIdent);
            }
        });
    }

    public void remove(final String branch, final String path, final String commitMessage,
                       final String authorName, final String authorEmail) {
        final PersonIdent personIdent = new PersonIdent(authorName, authorEmail);
        gitOperation(personIdent, new Callable<RevCommit>() {
            public RevCommit call() throws Exception {
                Git aGit = git;
                File rootDir = getRootGitDirectory();
                return doRemove(aGit, rootDir, branch, path, commitMessage, personIdent);
            }
        });
    }

    @Override
    public List<String> branches() {
        return gitOperation(getStashPersonIdent(), new Callable<List<String>>() {
            @Override
            public List<String> call() throws Exception {
                return doListBranches(git);
            }
        });
    }

    @Override
    protected Iterable<PushResult> doPush(Git git) throws Exception {
        return this.git.push().setCredentialsProvider(getCredentials()).setRemote(getRemote()).call();
    }

    @Override
    public String getHEAD() {
        return doGetHead(git);
    }

    @Override
    public List<CommitInfo> history(String branch, String objectId, String path, int limit) {
        try {
            return doHistory(git, branch, objectId, path, limit);
        } catch (Exception e) {
            throw new RuntimeIOException(e);
        }
    }

    /**
     * Retrieves a Java Date from a Git commit.
     *
     * @param commit the commit
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
        return doDiff(git, objectId, baseObjectId, path);
    }

    public File getRootGitDirectory() {
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
        File confDir = getRootGitDirectory();
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
                    LOG.error("Failed to command remote repo " + repo + " due: " + e.getMessage(), e);
                    // lets just use an empty repo instead
                }
            } else if (!isCloneRemoteRepoOnStartup()) {
                LOG.info("Clone git repo on startup disabled");
            }
            InitCommand initCommand = Git.init();
            initCommand.setDirectory(confDir);
            git = initCommand.call();
            LOG.info("Initialised an empty git configuration repo at {}", confDir.getCanonicalPath());

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
            Repository repository = git.getRepository();
            StoredConfig config = repository.getConfig();
            String url = config.getString("remote", "origin", "url");
            if (Strings.isBlank(url)) {
                logPull("No remote repository defined for the git repository at " + getRootGitDirectory().getCanonicalPath() + " so not doing a pull");
                return;
            }
            String branch = repository.getBranch();
            String mergeUrl = config.getString("branch", branch, "merge");
            if (Strings.isBlank(mergeUrl)) {
                logPull("No merge spec for branch." + branch + ".merge in the git repository at " + getRootGitDirectory().getCanonicalPath() + " so not doing a pull");
                return;
            }
            logPull("Performing a pull in git repository " + getRootGitDirectory().getCanonicalPath() + " on remote URL: " + url);

            git.pull().setCredentialsProvider(cp).setRebase(true).call();
        } catch (Throwable e) {
            String credText = "";
            if (cp instanceof UsernamePasswordCredentialsProvider) {
            }
            LOG.error("Failed to pull from the remote git repo with credentials " + cp + " due: " + e.getMessage() + ". This exception is ignored.", e);
        } finally {
            firstPull = false;
        }
    }

    protected void logPull(String message) {
        if (firstPull) {
            LOG.info(message + ". Subsequent pull attempts will use debug logging");
        } else {
            LOG.debug(message);
        }
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
                    hasHead = git.getRepository().getAllRefs().containsKey("HEAD");
                } catch (NoHeadException e) {
                    hasHead = false;
                }

                if (hasHead) {
                    // lets stash any local changes just in case..
                    git.stashCreate().setPerson(personIdent).setWorkingDirectoryMessage("Stash before a write").setRef("HEAD").call();
                }
                if (isPullOnStartup() && isPullBeforeOperation() && Strings.isNotBlank(getRemoteRepository())) {
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
            LOG.warn("Failed to get the current branch due: " + e.getMessage() + ". This exception is ignored.", e);
            return null;
        }
    }

    protected void checkoutBranch(Git git, String branch) throws GitAPIException {
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
                            + " with branch " + branch + " on remote repo: " + remoteRepository + " due: " + e.getMessage() + ". This exception is ignored.", e);
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