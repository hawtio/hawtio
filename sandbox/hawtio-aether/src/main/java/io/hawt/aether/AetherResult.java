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
package io.hawt.aether;

import io.hawt.util.Strings;
import org.sonatype.aether.artifact.Artifact;
import org.sonatype.aether.graph.Dependency;
import org.sonatype.aether.graph.DependencyNode;

import java.io.File;
import java.util.List;

/**
 */
public class AetherResult {
    private final DependencyNode rootNode;
    private final List<File> files;
    private final String classPath;

    public AetherResult(DependencyNode rootNode, List<File> files, String classPath) {
        this.rootNode = rootNode;
        this.files = files;
        this.classPath = classPath;
    }

    public String getClassPath() {
        return classPath;
    }

    public List<File> getFiles() {
        return files;
    }

    public DependencyNode getRootNode() {
        return rootNode;
    }

    public String treeString() {
        StringBuilder builder = new StringBuilder();
        displayTree(rootNode, "", builder);
        return builder.toString();
    }

    protected void displayTree(DependencyNode node, String indent, StringBuilder sb) {
        sb.append(indent + node.getDependency()).append("\n");
        String childIndent = indent + "  ";
        List<DependencyNode> children = node.getChildren();
        for (DependencyNode child : children) {
            displayTree(child, childIndent, sb);
        }
    }

    public String jsonString() {
        StringBuilder builder = new StringBuilder();
        toJson(rootNode, "", builder, true);
        return builder.toString();
    }

    protected void toJson(DependencyNode node, String indent, StringBuilder sb, boolean last) {
        sb.append(indent + "{\n");
        String childIndent = indent + "  ";

        Dependency dependency = node.getDependency();
        Artifact artifact = dependency.getArtifact();
        appendJsonProperty(sb, childIndent, "groupId", artifact.getGroupId(), false);
        appendJsonProperty(sb, childIndent, "artifactId", artifact.getArtifactId(), false);
        String classifier = artifact.getClassifier();
        if (Strings.isNotBlank(classifier)) {
            appendJsonProperty(sb, childIndent, "classifier", classifier, false);
        }
        String extension = artifact.getExtension();
        if (Strings.isNotBlank(extension) && !extension.equals("jar")) {
            appendJsonProperty(sb, childIndent, "extension", extension, false);
        }
        String scope = dependency.getScope();
        if (Strings.isNotBlank(scope)) {
            appendJsonProperty(sb, childIndent, "scope", scope, false);
        }
        List<DependencyNode> children = node.getChildren();
        if (!children.isEmpty()) {
            sb.append(childIndent);
            sb.append("\"children\": [\n");
            String grandChildIndent = childIndent + "  ";

            int idx = 0;
            int lastIdx = children.size();
            for (DependencyNode child : children) {
                toJson(child, grandChildIndent, sb, ++idx >= lastIdx);
            }
            sb.append(childIndent);
            sb.append("],\n");
        }
        appendJsonProperty(sb, childIndent, "version", artifact.getVersion(), true);

        sb.append(indent);
        sb.append("}");
        if (!last) {
            sb.append(",");
        }
        sb.append("\n");
    }

    protected void appendJsonProperty(StringBuilder sb, String childIndent, String name, String value, boolean last) {
        sb.append(childIndent);
        sb.append("\"");
        sb.append(name);
        sb.append("\": \"");
        sb.append(value);
        sb.append("\"");
        if (!last) {
            sb.append(",");
        }
        sb.append("\n");
    }
}
