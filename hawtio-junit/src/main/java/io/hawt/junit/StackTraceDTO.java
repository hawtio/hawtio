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
package io.hawt.junit;

/**
 * A DTO for a line from a stack trace
 */
public class StackTraceDTO {
    private String className;
    private String fileName;
    private int lineNumber;
    private String methodName;
    private boolean nativeMethod;

    public StackTraceDTO() {
    }

    public StackTraceDTO(StackTraceElement stackTraceElement) {
        this.className = stackTraceElement.getClassName();
        this.fileName = stackTraceElement.getFileName();
        this.lineNumber = stackTraceElement.getLineNumber();
        this.methodName = stackTraceElement.getMethodName();
        this.nativeMethod = stackTraceElement.isNativeMethod();

        // TODO would be nice to add the maven coordinates so we can link to the exact line of source code ;)
    }

    @Override
    public String toString() {
        return "StackTraceDTO{" + className + "." + methodName
                + "(" + fileName + ":" + lineNumber + ")}";
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public int getLineNumber() {
        return lineNumber;
    }

    public void setLineNumber(int lineNumber) {
        this.lineNumber = lineNumber;
    }

    public String getMethodName() {
        return methodName;
    }

    public void setMethodName(String methodName) {
        this.methodName = methodName;
    }

    public boolean isNativeMethod() {
        return nativeMethod;
    }

    public void setNativeMethod(boolean nativeMethod) {
        this.nativeMethod = nativeMethod;
    }
}
