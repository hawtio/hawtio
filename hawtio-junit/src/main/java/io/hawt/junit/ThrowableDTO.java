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

import java.util.ArrayList;
import java.util.List;

/**
 * A DTO for an exception
 */
public class ThrowableDTO {

    private String localizedMessage;
    private String message;
    private List<StackTraceDTO> stackTraceList = new ArrayList<StackTraceDTO>();

    /**
     * Adds the exception and all of the causes to the given list of exceptions
     */
    public static void addThrowableAndCauses(List<ThrowableDTO> exceptions, Throwable exception) {
        if (exception != null) {
            ThrowableDTO dto = new ThrowableDTO(exception);
            exceptions.add(dto);
            Throwable cause = exception.getCause();
            if (cause != null && cause != exception) {
                addThrowableAndCauses(exceptions, cause);
            }
        }
    }

    public ThrowableDTO() {
    }

    public ThrowableDTO(Throwable exception) {
        this.message = exception.getMessage();
        this.localizedMessage = exception.getLocalizedMessage();
        StackTraceElement[] stackTraceElements = exception.getStackTrace();
        if (stackTraceElements != null) {
            for (StackTraceElement stackTraceElement : stackTraceElements) {
                stackTraceList.add(new StackTraceDTO(stackTraceElement));
            }
        }
    }

    @Override
    public String toString() {
        return "ThrowableDTO{" +
                "message='" + message + '\'' +
                ", stackTraceList=" + stackTraceList +
                '}';
    }

    public String getLocalizedMessage() {
        return localizedMessage;
    }

    public void setLocalizedMessage(String localizedMessage) {
        this.localizedMessage = localizedMessage;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<StackTraceDTO> getStackTraceList() {
        return stackTraceList;
    }

    public void setStackTraceList(List<StackTraceDTO> stackTraceList) {
        this.stackTraceList = stackTraceList;
    }
}
