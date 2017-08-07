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

import org.junit.runner.Description;
import org.junit.runner.notification.Failure;

import java.util.ArrayList;
import java.util.List;

/**
 * A DTO representing a test failure
 */
public class FailureDTO {
    private String description;
    private String trace;
    private String testHeader;
    private String message;
    private List<ThrowableDTO> exceptions = new ArrayList<ThrowableDTO>();

    public FailureDTO() {
    }

    public FailureDTO(Failure failure) {
        this.message = failure.getMessage();
        this.testHeader = failure.getTestHeader();
        this.trace = failure.getTrace();
        Description description = failure.getDescription();
        if (description != null) {
            // TODO we could return the entire description tree?
            this.description = description.toString();
        }
        ThrowableDTO.addThrowableAndCauses(exceptions, failure.getException());
    }

    @Override
    public String toString() {
        return "FailureDTO{" +
                "testHeader='" + testHeader + '\'' +
                ", message='" + message + '\'' +
                '}';
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTrace() {
        return trace;
    }

    public void setTrace(String trace) {
        this.trace = trace;
    }

    public String getTestHeader() {
        return testHeader;
    }

    public void setTestHeader(String testHeader) {
        this.testHeader = testHeader;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ThrowableDTO> getExceptions() {
        return exceptions;
    }

    public void setExceptions(List<ThrowableDTO> exceptions) {
        this.exceptions = exceptions;
    }
}
