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

import java.util.Date;

/**
 * Represents information about a commit log or history
 */
public class CommitInfo {
    private final String commitHashText;
    private final String name;
    private final String kind;
    private final String author;
    private final Date date;
    private final boolean merge;
    private final String trimmedMessage;
    private final String shortMessage;

    public CommitInfo(String commitHashText, String name, String kind, String author, Date date, boolean merge, String trimmedMessage, String shortMessage) {
        this.commitHashText = commitHashText;
        this.name = name;
        this.kind = kind;
        this.author = author;
        this.date = date;
        this.merge = merge;
        this.trimmedMessage = trimmedMessage;
        this.shortMessage = shortMessage;
    }

    @Override
    public String toString() {
        return "CommitInfo(hash " + commitHashText + " kind " + kind + " author " + author + " date " + date + " merge " + merge + " " + shortMessage + ")";
    }

    public String getAuthor() {
        return author;
    }

    public String getCommitHashText() {
        return commitHashText;
    }

    public Date getDate() {
        return date;
    }

    public String getKind() {
        return kind;
    }

    public boolean isMerge() {
        return merge;
    }

    public String getName() {
        return name;
    }

    public String getShortMessage() {
        return shortMessage;
    }

    public String getTrimmedMessage() {
        return trimmedMessage;
    }
}
