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

import java.util.List;

/**
 * Represents the text of a text file or a directory
 */
public class FileContents {
    private boolean directory;
    private List<FileInfo> children;
    private String text;

    public FileContents(boolean directory, String text, List<FileInfo> children) {
        this.directory = directory;
        this.text = text;
        this.children = children;
    }

    public List<FileInfo> getChildren() {
        return children;
    }

    public String getText() {
        return text;
    }

    public boolean isDirectory() {
        return directory;
    }
}
