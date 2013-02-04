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

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.io.File;
import java.io.IOException;

/**
 * A helper bean to create a local git repo for configuration data which if configured will push/pull
 * from some central repo
 */
public class GitHelper {
    private File configDirectory;
    private Git git;

    public void init() throws IOException {
        // lets check if we have a config directory if not lets create one...
        initialiseGitRepo();
    }

    public void destroy() {
    }

    public File getConfigDirectory() throws IOException {
        if (configDirectory == null) {
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
        }
        return configDirectory;
    }

    public void setConfigDirectory(File configDirectory) {
        this.configDirectory = configDirectory;
    }

    public void initialiseGitRepo() throws IOException {
        File confDir = getConfigDirectory();
        FileRepositoryBuilder builder = new FileRepositoryBuilder();
        Repository repository = builder.setGitDir(confDir)
          .readEnvironment() // scan environment GIT_* variables
          .findGitDir() // scan up the file system tree
          .build();

        git = new Git(repository);

        if (!new File(confDir, ".git").exists()) {
            System.out.println("============ no .git directory in " + confDir);
        }
    }
}