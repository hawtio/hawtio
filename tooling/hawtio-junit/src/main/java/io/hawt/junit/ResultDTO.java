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

import org.junit.runner.Result;
import org.junit.runner.notification.Failure;

import java.util.ArrayList;
import java.util.List;

/**
 * A DTO representing the results of a test
 */
public class ResultDTO {
    boolean successful;
    int ignoreCount;
    int failureCount;
    int runCount;
    long runTime;
    List<FailureDTO> failures = new ArrayList<FailureDTO>();

    public ResultDTO() {
    }

    public ResultDTO(Result result) {
        this.successful = result.wasSuccessful();
        this.ignoreCount = result.getIgnoreCount();
        this.failureCount = result.getFailureCount();
        this.runCount = result.getRunCount();
        this.runTime = result.getRunTime();
        List<Failure> failureList = result.getFailures();
        for (Failure failure : failureList) {
            failures.add(new FailureDTO(failure));
        }
    }

    @Override
    public String toString() {
        return "ResultDTO{" +
                "successful=" + successful +
                ", runCount=" + runCount +
                ", failureCount=" + failureCount +
                ", ignoreCount=" + ignoreCount +
                ", runTime=" + runTime +
                '}';
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public int getIgnoreCount() {
        return ignoreCount;
    }

    public void setIgnoreCount(int ignoreCount) {
        this.ignoreCount = ignoreCount;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }

    public int getRunCount() {
        return runCount;
    }

    public void setRunCount(int runCount) {
        this.runCount = runCount;
    }

    public long getRunTime() {
        return runTime;
    }

    public void setRunTime(long runTime) {
        this.runTime = runTime;
    }

    public List<FailureDTO> getFailures() {
        return failures;
    }

    public void setFailures(List<FailureDTO> failures) {
        this.failures = failures;
    }
}
