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
package io.hawt.introspect;

import java.beans.PropertyDescriptor;

/**
 * A simple DTO for Property information
 */
public class PropertyDTO {
    private String name;
    private String typeName;
    private boolean readable = true;
    private boolean writeable = true;
    private String description;
    private String displayName;
    private transient Class<?> typeClass;

    public PropertyDTO() {
    }

    public PropertyDTO(PropertyDescriptor propertyDescriptor) {
        name = propertyDescriptor.getName();
        displayName = propertyDescriptor.getDisplayName();
        typeClass = propertyDescriptor.getPropertyType();
        typeName = typeClass.getName();
        description = propertyDescriptor.getShortDescription();
        readable = propertyDescriptor.getReadMethod() != null;
        writeable = propertyDescriptor.getWriteMethod() != null;
    }

    @Override
    public String toString() {
        return "Property(" + typeName + " " + name + ")";
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public boolean isReadable() {
        return readable;
    }

    public void setReadable(boolean readable) {
        this.readable = readable;
    }

    public boolean isWriteable() {
        return writeable;
    }

    public void setWriteable(boolean writeable) {
        this.writeable = writeable;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    Class<?> getTypeClass() {
        return typeClass;
    }

    void setTypeClass(Class<?> typeClass) {
        this.typeClass = typeClass;
    }
}
