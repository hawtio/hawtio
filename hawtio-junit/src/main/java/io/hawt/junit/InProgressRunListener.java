package io.hawt.junit;

import org.junit.runner.Description;
import org.junit.runner.Result;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;

public class InProgressRunListener extends RunListener {

    private long startTime;
    private long runTime;
    private final InProgressDTO inProgressDTO;

    public InProgressRunListener(InProgressDTO inProgressDTO) {
        this.inProgressDTO = inProgressDTO;
    }

    @Override
    public void testRunStarted(Description description) throws Exception {
        startTime = System.currentTimeMillis();

        inProgressDTO.setStartTime(startTime);
    }

    @Override
    public void testRunFinished(Result result) throws Exception {
        long endTime = System.currentTimeMillis();
        inProgressDTO.setEndTime(endTime);

        runTime += endTime - startTime;
        inProgressDTO.updateRuntime(runTime);
    }

    @Override
    public void testStarted(Description description) throws Exception {
        inProgressDTO.setTestClass(description.getTestClass().getName());
        inProgressDTO.setTestMethod(description.getMethodName());
    }

    @Override
    public void testFinished(Description description) throws Exception {
        inProgressDTO.onTestFinished();

        inProgressDTO.setTestClass(null);
        inProgressDTO.setTestMethod(null);
    }

    @Override
    public void testFailure(Failure failure) throws Exception {
        inProgressDTO.onTestFailed();

        inProgressDTO.setTestClass(null);
        inProgressDTO.setTestMethod(null);
    }

    @Override
    public void testAssumptionFailure(Failure failure) {
        // noop
    }

    @Override
    public void testIgnored(Description description) throws Exception {
        inProgressDTO.onTestIgnored();

        inProgressDTO.setTestClass(null);
        inProgressDTO.setTestMethod(null);
    }
}
