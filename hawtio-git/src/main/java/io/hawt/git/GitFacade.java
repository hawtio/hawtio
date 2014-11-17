package io.hawt.git;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.Callable;

import io.hawt.config.ConfigFacade;
import io.hawt.util.Files;
import io.hawt.util.Function;
import io.hawt.util.IOHelper;
import io.hawt.util.Objects;
import io.hawt.util.Strings;
import io.hawt.util.Zips;
import org.eclipse.jgit.api.CheckoutCommand;
import org.eclipse.jgit.api.CloneCommand;
import org.eclipse.jgit.api.CommitCommand;
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
import org.eclipse.jgit.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static io.hawt.git.GitHelper.doUploadFiles;

/**
 * A git bean to create a local git repo for configuration data which if configured will push/pull
 * from some central repo
 */
public class GitFacade extends GitFacadeSupport {
    private static final transient Logger LOG = LoggerFactory.getLogger(GitFacade.class);

    private static GitFacade singleton;

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
    private ConfigFacade config;
    private String initialImportURLs;
    private String defaultGitAttributes = "*.gif binary\n" +
            "*.jpg binary\n" +
            "*.jpeg binary\n" +
            "*.pdf binary\n" +
            "*.png binary\n";


    public static GitFacade getSingleton() {
        return singleton;
    }

    public static String trimLeadingSlash(String path) {
        String name = path;
        if (name != null && name.startsWith("/")) {
            name = name.substring(1);
        }
        return name;
    }

    public void init() throws Exception {
        config = ConfigFacade.getSingleton();

        if (config.isOffline()) {
            // lets avoid cloning or pulling the remote git repo for configuration on startup if offline mode
            cloneRemoteRepoOnStartup = false;
            pullOnStartup = false;
        }

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
                public String toString() {
                    return "pull()";
                }

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
        singleton = this;
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

    public String getInitialImportURLs() {
        return initialImportURLs;
    }

    /**
     * Sets the URLs which are used to import content in a newly created git repository
     */
    public void setInitialImportURLs(String initialImportURLs) {
        this.initialImportURLs = initialImportURLs;
    }

    @Override
    public String getContent(String objectId, String blobPath) {
        return doGetContent(git, objectId, blobPath);
    }

    public FileContents read(final String branch, final String pathOrEmpty) throws IOException, GitAPIException {
        return gitOperation(getStashPersonIdent(), new Callable<FileContents>() {
            @Override
            public String toString() {
                return "doRead(" + branch + ", " + pathOrEmpty + ")";
            }

            @Override
            public FileContents call() throws Exception {
                return doRead(git, getRootGitDirectory(), branch, pathOrEmpty);
            }
        });
    }

    public <T> T readFile(final String branch, final String pathOrEmpty, final Function<File,T> callback) throws IOException, GitAPIException {
        return gitOperation(getStashPersonIdent(), new Callable<T>() {
            @Override
            public String toString() {
                return "doReadFile(" + branch + ", " + pathOrEmpty + ", " + callback + ")";
            }

            @Override
            public T call() throws Exception {
                return doReadFile(git, getRootGitDirectory(), branch, pathOrEmpty, callback);
            }
        });
    }

    public <T> T writeFile(final String branch, final String pathOrEmpty, final WriteCallback<T> callback) throws IOException, GitAPIException {
        return gitOperation(getStashPersonIdent(), new Callable<T>() {
            @Override
            public String toString() {
                return "doWriteFile(" + branch + ", " + pathOrEmpty + ", " + callback + ")";
            }

            @Override
            public T call() throws Exception {
                return doWriteFile(git, getRootGitDirectory(), branch, pathOrEmpty, callback);
            }
        });
    }

    @Override
    public FileInfo exists(final String branch, final String pathOrEmpty) throws IOException, GitAPIException {
        return gitOperation(getStashPersonIdent(), new Callable<FileInfo>() {
            @Override
            public String toString() {
                return "doExists(" + branch + ", " + pathOrEmpty + ")";
            }

            @Override
            public FileInfo call() throws Exception {
                File rootDir = getRootGitDirectory();
                return doExists(git, rootDir, branch, pathOrEmpty, false);
            }
        });
    }

    public List<String> completePath(final String branch, final String completionText, final boolean directoriesOnly) {
        return gitOperation(getStashPersonIdent(), new Callable<List<String>>() {
            @Override
            public String toString() {
                return "completePath(" + branch + ", " + completionText + ")";
            }

            @Override
            public List<String> call() throws Exception {
                File rootDir = getRootGitDirectory();
                return doCompletePath(git, rootDir, branch, completionText, directoriesOnly);
            }
        });
    }

    @Override
    public String readJsonChildContent(final String branch, final String path, String fileNameWildcardOrBlank, final String search) throws IOException {
        final String fileNameWildcard = (Strings.isBlank(fileNameWildcardOrBlank)) ? "*.json" : fileNameWildcardOrBlank;
        return gitOperation(getStashPersonIdent(), new Callable<String>() {
            @Override
            public String toString() {
                return "readJsonChildContent(" + branch + ", " + path + ")";
            }

            @Override
            public String call() throws Exception {
                File rootDir = getRootGitDirectory();
                return doReadJsonChildContent(git, rootDir, branch, path, fileNameWildcard, search);
            }
        });
    }

    @Override
    public CommitInfo writeBase64(String branch, String path, String commitMessage, String authorName, String authorEmail, String contentsBase64) {
        return write(branch, path, commitMessage, authorName, authorEmail, Base64.decode(contentsBase64));
    }

    public CommitInfo write(final String branch, final String path, final String commitMessage,
                      final String authorName, final String authorEmail, final String contents) {
        return write(branch, path, commitMessage, authorName, authorEmail, contents.getBytes());
    }

    private CommitInfo write(final String branch, final String path, final String commitMessage, String authorName, String authorEmail, final byte[] data) {
        final PersonIdent personIdent = new PersonIdent(authorName, authorEmail);
        return gitOperation(personIdent, new Callable<CommitInfo>() {
            @Override
            public String toString() {
                return "doWrite(" + branch + ", " + path + ")";
            }

            public CommitInfo call() throws Exception {
                checkoutBranch(git, branch);
                File rootDir = getRootGitDirectory();
                return doWrite(git, rootDir, branch, path, data, personIdent, commitMessage);
            }
        });
    }

    @Override
    public CommitInfo createDirectory(final String branch, final String path, final String commitMessage,
                                     final String authorName, final String authorEmail) {
        final PersonIdent personIdent = new PersonIdent(authorName, authorEmail);
        return gitOperation(personIdent, new Callable<CommitInfo>() {
            @Override
            public String toString() {
                return "createDirectory(" + branch + ", " + path + ")";
            }

            public CommitInfo call() throws Exception {
                checkoutBranch(git, branch);
                File rootDir = getRootGitDirectory();
                return doCreateDirectory(git, rootDir, branch, path, personIdent, commitMessage);
            }
        });
    }

    @Override
    public void createBranch(final String fromBranch, final String newBranch) {
        gitOperation(getStashPersonIdent(), new Callable<Object>() {
            @Override
            public String toString() {
                return "createBranch(" + fromBranch + ", " + newBranch + ")";
            }

            public Object call() throws Exception {
                doCreateBranch(git, fromBranch, newBranch);
                return null;
            }
        });
    }

    @Override
    public List<CommitTreeInfo> getCommitTree(final String commitId) {
        return gitOperation(getStashPersonIdent(), new Callable<List<CommitTreeInfo>>() {
            @Override
            public String toString() {
                return "getTree(" + commitId + ")";
            }

            public List<CommitTreeInfo> call() throws Exception {
                return doGetCommitTree(git, commitId);
            }
        });
    }


    @Override
    public CommitInfo getCommitInfo(final String commitId) {
        return gitOperation(getStashPersonIdent(), new Callable<CommitInfo>() {
            @Override
            public String toString() {
                return "getCommitInfo(" + commitId + ")";
            }

            public CommitInfo call() throws Exception {
                return doGetCommitInfo(git, commitId);
            }
        });
    }


    @Override
    public void revertTo(final String branch, final String objectId, final String blobPath, final String commitMessage,
                         final String authorName, final String authorEmail) {
        final PersonIdent personIdent = new PersonIdent(authorName, authorEmail);
        gitOperation(personIdent, new Callable<Void>() {
            @Override
            public String toString() {
                return "revertTo(" + branch + ", " + objectId + ", " + blobPath + ")";
            }

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
            @Override
            public String toString() {
                return "rename(" + branch + ", " + oldPath + ", " + newPath + ")";
            }

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
            @Override
            public String toString() {
                return "remove(" + branch + ", " + path + ")";
            }

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
            public String toString() {
                return "doListBranches()";
            }

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

    public String getDefaultGitAttributes() {
        return defaultGitAttributes;
    }

    public void setDefaultGitAttributes(String defaultGitAttributes) {
        this.defaultGitAttributes = defaultGitAttributes;
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

    /**
     * Uploads the given local file name to the given branch and path; unzipping any zips if the flag is true
     */
    @Override
    public void uploadFile(String branch, String path, boolean unzip, String sourceFileName, String destName) throws IOException, GitAPIException {
        Map<String, File> uploadedFiles = new HashMap<>();
        File sourceFile = new File(sourceFileName);
        if (!sourceFile.exists()) {
            throw new IllegalArgumentException("Source file does not exist: " + sourceFile);
        }
        uploadedFiles.put(destName, sourceFile);
        uploadFiles(branch, path, unzip, uploadedFiles);
    }

    /**
     * Uploads a list of files to the given branch and path
     */
    public void uploadFiles(String branch, String path, final boolean unzip, final Map<String, File> uploadFiles) throws IOException, GitAPIException {
        LOG.info("uploadFiles: branch: " + branch + " path: " + path + " unzip: " + unzip + " uploadFiles: " + uploadFiles);

        WriteCallback<Object> callback = new WriteCallback<Object>() {
            @Override
            public Object apply(WriteContext context) throws IOException, GitAPIException {
                File folder = context.getFile();
                // lets copy the files into the folder so we can add them to git
                List<File> copiedFiles = new ArrayList<>();
                Set<Map.Entry<String, File>> entries = uploadFiles.entrySet();
                for (Map.Entry<String, File> entry : entries) {
                    String name = entry.getKey();
                    File uploadFile = entry.getValue();
                    File copiedFile = new File(folder, name);
                    Files.copy(uploadFile, copiedFile);
                    copiedFiles.add(copiedFile);
                }
                doUploadFiles(context, folder, unzip, copiedFiles);
                return null;
            }
        };
        writeFile(branch, path, callback);
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

            importInitialContent(git, confDir, branch);
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

    /**
     * When creating an empty initial git repository lets see if there are a list of URLs for zips
     * of content to include
     * @param git
     * @param branch
     */
    protected void importInitialContent(Git git, File rootFolder, String branch) {
        PersonIdent personIdent = getStashPersonIdent();

        // lets add a default .gitattributes file so if we add binary files they don't get broken as we add them
        File gitAttributes = new File(rootFolder, ".gitattributes");
        if (!gitAttributes.exists()) {
            try {
                IOHelper.write(gitAttributes, getDefaultGitAttributes());
                git.add().addFilepattern(".gitattributes").call();
                CommitCommand commit = git.commit().setAll(true).setAuthor(personIdent).setMessage("Added default .gitattributes");
                try {
                    commitThenPush(git, branch, commit);
                } catch (Exception e) {
                    LOG.warn("Failed to commit initial .gitattributes. " + e, e);
                }
            } catch (Exception e) {
                LOG.warn("Failed to write git " + gitAttributes + ". " + e, e);
            }
        }
        System.out.println("Importing initial URLs: " + initialImportURLs);
        if (Strings.isNotBlank(initialImportURLs)) {
            String[] split = initialImportURLs.split(",");
            if (split != null) {
                for (String importURL : split) {
                    if (Strings.isNotBlank(importURL)) {
                        InputStream inputStream = null;
                        try {
                            inputStream = ConfigFacade.getSingleton().openURL(importURL);
                        } catch (Throwable e) {
                            LOG.warn("Could not load initial import URL: " + importURL + ". " + e, e);
                            return;
                        }
                        if (inputStream == null) {
                            LOG.warn("Could not load initial import URL: " + importURL);
                            return;
                        }

                        try {
                            Zips.unzip(inputStream, rootFolder);
                        } catch (Throwable e) {
                            LOG.warn("Failed to unzip initial import URL: " + importURL + ". " + e, e);
                        }
                    }
                }
            }
        }

        // now lets add any expanded stuff to git
        int count = 0;
        File[] files = rootFolder.listFiles();
        if (files != null) {
            for (File file : files) {
                String name = file.getName();
                if (!Objects.equals(".git", name) && !Objects.equals(".gitattributes", name)) {
                    try {
                        count += addFiles(git, rootFolder, file);
                    } catch (Throwable e) {
                        LOG.warn("Failed to add file " + name + ". " + e, e);
                    }
                }
            }
        }

        // commit any changes
        if (count > 0) {
            CommitCommand commit = git.commit().setAll(true).setAuthor(personIdent).setMessage("Added import URLs: " + initialImportURLs);
            try {
                commitThenPush(git, branch, commit);
            } catch (Throwable e) {
                LOG.warn("Failed to commit initial import of " + initialImportURLs + ". " + e, e);
            }
        }
    }

    private int addFiles(Git git, File rootDir, File... files) throws GitAPIException, IOException {
        int counter = 0;
        for (File file : files) {
            String relativePath = getFilePattern(rootDir, file);
            git.add().addFilepattern(relativePath).call();
            counter++;
        }
        return counter;
    }

    private String getFilePattern(File rootDir, File file) throws IOException {
        String relativePath = Files.getRelativePath(rootDir, file);
        if (relativePath.startsWith(File.separator)) {
            relativePath = relativePath.substring(1);
        }
        return relativePath.replace(File.separatorChar, '/');
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
        boolean debug = LOG.isDebugEnabled();
        long start = 0;
        if (debug) {
            start = System.currentTimeMillis();
        }
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
                T answer = callable.call();
                if (debug) {
                    long end = System.currentTimeMillis();
                    LOG.debug("Operation " + callable + " took " + (end - start) + " ms");
                }
                return answer;
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