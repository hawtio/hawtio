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

import io.hawt.util.Files;
import org.eclipse.jgit.api.AddCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.PersonIdent;

import java.io.File;
import java.io.IOException;

import static io.hawt.git.GitFacadeSupport.getFilePattern;

/**
 * The context when performing reads and writes within git
 */
public class WriteContext {
    private final Git git;
    private final File rootDir;
    private final File file;
    private boolean requiresCommit;
    private PersonIdent author;
    private String message;

    public WriteContext(Git git, File rootDir, File file) {
        this.git = git;
        this.rootDir = rootDir;
        this.file = file;
    }


    /**
     * Adds the given file to git
     */
    public void addFile(File file) throws IOException, GitAPIException {
        String path = Files.getRelativePath(rootDir, file);
        String filePattern = getFilePattern(path);
        AddCommand add = git.add().addFilepattern(filePattern).addFilepattern(".");
        add.call();
        requiresCommit = true;
    }

    // Properties
    //-------------------------------------------------------------------------

    public Git getGit() {
        return git;
    }

    public File getRootDir() {
        return rootDir;
    }

    public File getFile() {
        return file;
    }

    public boolean isRequiresCommit() {
        return requiresCommit;
    }

    public void setRequiresCommit(boolean requiresCommit) {
        this.requiresCommit = requiresCommit;
    }

    public PersonIdent getAuthor() {
        return author;
    }

    public void setAuthor(PersonIdent author) {
        this.author = author;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
