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
import org.eclipse.jgit.api.CommitCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.InitCommand;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.NoHeadException;
import org.eclipse.jgit.lib.PersonIdent;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.io.File;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.List;
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

    /**
     * Lists the contents of the given directory path
     */
    public List<FileInfo> contents(String path) {
        File rootDir = getConfigDirectory();
        File dir = new File(rootDir, path);
        List<FileInfo> answer = new ArrayList<FileInfo>();
        if (dir.exists()) {
            File[] files = dir.listFiles();
            for (File file : files) {
                if (!file.getName().equals(".git") || !path.equals("/")) {
                    answer.add(FileInfo.createFileInfo(rootDir, file));
                }
            }
        }
        return answer;
    }

    /**
     * Reads the file contents of the given path
     *
     * @return
     */
    public String read(String branch, String path) throws IOException {
        File file = getFile(path);
        return IOHelper.readFully(file);
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
        Repository repository = builder.setGitDir(confDir)
                .readEnvironment() // scan environment GIT_* variables
                .findGitDir() // scan up the file system tree
                .build();

        if (!new File(confDir, ".git").exists()) {
            InitCommand initCommand = Git.init();
            initCommand.setDirectory(confDir);
            git = initCommand.call();
        } else {
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