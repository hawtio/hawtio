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
package io.hawt.kubernetes;

/**
 * A DTO for the details of an App
 */
public class AppDTO {
    private final String appPath;
    private final String iconPath;
    private final String name;
    private final String description;
    private final String metadataPath;
    private final String version;
    private final String groupId;
    private final String artifactId;

    public AppDTO(String appPath, String iconPath, String name, String description, String metadataPath, String version, String groupId, String artifactId) {
        this.appPath = appPath;
        this.iconPath = iconPath;
        this.name = name;
        this.description = description;
        this.metadataPath = metadataPath;
        this.version = version;
        this.groupId = groupId;
        this.artifactId = artifactId;
    }

    @Override
    public String toString() {
        return "AppDTO{" +
                "appPath='" + appPath + '\'' +
                ", iconPath='" + iconPath + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", version='" + version + '\'' +
                ", groupId='" + groupId + '\'' +
                ", artifactId='" + artifactId + '\'' +
                '}';
    }

    public String getAppPath() {
        return appPath;
    }

    public String getArtifactId() {
        return artifactId;
    }

    public String getDescription() {
        return description;
    }

    public String getGroupId() {
        return groupId;
    }

    public String getIconPath() {
        return iconPath;
    }

    public String getMetadataPath() {
        return metadataPath;
    }

    public String getName() {
        return name;
    }

    public String getVersion() {
        return version;
    }
}
