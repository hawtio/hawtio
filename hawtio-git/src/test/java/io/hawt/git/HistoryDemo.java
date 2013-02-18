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

import org.eclipse.jgit.api.errors.GitAPIException;

import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * A little sample program that lets you view the log and history of one or more paths or files
 */
public class HistoryDemo {
    private final File directory;
    private GitFacade git = new GitFacade();

    public static void main(String[] args) {
        if (args.length <= 0) {
            System.out.println("Arguments: directoryToUse fileOrDirectoryNamesToViewHistory");
            return;
        }
        try {
            String dir = args[0];
            File configDirectory = new File(dir);
            if (!configDirectory.exists()) {
                System.out.println("Warning directory " + dir + " does not exist!");
            }
            HistoryDemo demo = new HistoryDemo(configDirectory);
            demo.run(args, 1);
        } catch (Exception e) {
            System.out.println("Caught: " + e);
            e.printStackTrace();
        }
    }

    public HistoryDemo(File directory) {
        this.directory = directory;
    }

    public void run(String[] args, int offset) throws Exception {
        git.setConfigDirectory(directory);
        git.init();

        printHistory(null);

        for (int i = offset; i < args.length; i++) {
            String path = args[i];
            printHistory(path);
        }

        git.destroy();
    }

    public void printHistory(String path) throws IOException, GitAPIException {
        List<CommitInfo> log = git.history(null, path, 0);
        System.out.println("Showing history for path " + path);
        for (CommitInfo info : log) {
            System.out.println("  " + info);

            if (path != null && path.indexOf(".") > 0) {
                String content = git.getContent(info.getName(), path);
                System.out.println("    = " + content);
            }
        }
        System.out.println();
    }

}
