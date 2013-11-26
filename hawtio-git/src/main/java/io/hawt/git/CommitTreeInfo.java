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

import org.eclipse.jgit.lib.AnyObjectId;
import org.eclipse.jgit.lib.FileMode;

/**
 * Represent part of a commit
 */
public class CommitTreeInfo {
    private String mode;
    private String path;
    private String name;
    private String id;

    public CommitTreeInfo() {
    }

    public CommitTreeInfo(FileMode mode, String path, String name, AnyObjectId id) {
        this.mode = mode.toString();
        this.path = path;
        this.name = name;
        this.id = id.getName();
    }

    @Override
    public String toString() {
        return "CommitTreeInfo{" +
                "mode='" + mode + '\'' +
                ", path='" + path + '\'' +
                ", name='" + name + '\'' +
                ", id='" + id + '\'' +
                '}';
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
