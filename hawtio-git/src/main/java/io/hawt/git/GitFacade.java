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
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * A git bean to create a local git repo for configuration data which if configured will push/pull
 * from some central repo
 */
public class GitFacade {
    private File configDirectory;
    private Git git;

    public void init() throws IOException, GitAPIException {
        // lets check if we have a config directory if not lets create one...
        initialiseGitRepo();
    }

    public void destroy() {
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
     * @return
     */
    public String read(String branch, String path) throws IOException {
        File file = getFile(path);
        return IOHelper.readFully(file);
    }


    public void write(final String branch, final String path, final String commitMessage,
                      final String authorName, final String authorEmail, final String contents) {
        gitOperation(new Callable<RevCommit>() {
            public RevCommit call() throws Exception {
                File file = getFile(path);
                IOHelper.write(file, contents);

                //String filePattern = path;
                String filePattern = path;
                if (filePattern.startsWith("/")) filePattern = filePattern.substring(1);
                // lets try avoid the tree being empty not cached
                System.out.println("Using file pattern '" + filePattern + "'");
                AddCommand add = git.add().setUpdate(true).
                        addFilepattern(filePattern).addFilepattern("*").addFilepattern(".");
                add.call();

                CommitCommand commit = git.commit().setAll(true).setAuthor(authorName, authorEmail).setMessage(commitMessage);
                return commit.call();
            }
        });
    }

    public void move(String branch, String oldPath, String newPath) {
        // TODO
    }

    public void remove(String branch, String oldPath, String newPath) {
        // TODO
    }

    public File getConfigDirectory() {
        if (configDirectory == null) {
            try {
                String name = System.getProperty("hawtio.config.dir", "");
                if (name.length() > 0) {
                    configDirectory = new File(name);
                } else {
                    File file = File.createTempFile("hawtio-", "");
                    file.delete();
                    configDirectory = new File(file, "config");
                    configDirectory.mkdirs();
                }
                System.out.println("hawtio using config directory: " + configDirectory);
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


    /**
     * Performs the given operations on a clean git repository
     */
    protected <T> T gitOperation(Callable<T> callable) {
        // TODO synchronized!

        try {
            Status status = git.status().call();

            System.out.println("Status: " + status);


        // TODO pull
        // TODO stash
            return callable.call();
        } catch (Exception e) {
            throw new RuntimeIOException(e);
        }
    }

}