package io.hawt.junit;

public class InProgressDTO extends ResultDTO {

    private String testClass;
    private String testMethod;
    private long startTime;
    private long endTime;

    public long getStartTime() {
        return startTime;
    }

    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }

    public long getEndTime() {
        return endTime;
    }

    public void setEndTime(long endTime) {
        this.endTime = endTime;
    }

    public boolean isRunning() {
        return endTime == 0;
    }

    @Override
    public long getRunTime() {
        if (runTime == 0) {
            return System.currentTimeMillis() - startTime;
        } else {
            return super.getRunTime();
        }
    }

    @Override
    public boolean isSuccessful() {
        return failureCount == 0;
    }

    public void onTestFinished() {
        runCount++;
    }

    public void onTestFailed() {
        failureCount++;
    }

    public void onTestIgnored() {
        ignoreCount++;
    }

    public void updateRuntime(long runtime) {
        this.runTime = runtime;
    }

    public String getTestClass() {
        return testClass;
    }

    public void setTestClass(String testClass) {
        this.testClass = testClass;
    }

    public String getTestMethod() {
        return testMethod;
    }

    public void setTestMethod(String testMethod) {
        this.testMethod = testMethod;
    }
}
