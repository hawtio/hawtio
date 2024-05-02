package io.hawt.tests.utils.rp;

import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.support.descriptor.ClassSource;
import org.junit.platform.launcher.TestExecutionListener;
import org.junit.platform.launcher.TestIdentifier;

import com.google.auto.service.AutoService;

import java.util.Stack;

import io.hawt.tests.features.utils.Attachments;

@AutoService(TestExecutionListener.class)
public class RPTestExecutionListener implements TestExecutionListener {

    private static String transformReportingName(String name) {
        return name.replace("()", "").replace("(", "{").replace(")", "}");
    }

    private Stack<String> scenarioParts = new Stack<>();

    @Override
    public void executionStarted(TestIdentifier testIdentifier) {
        if (testIdentifier.getUniqueId().contains("engine:cucumber")) {
            scenarioParts.push(testIdentifier.getDisplayName());
            if (scenarioParts.size() == 2) {
                Attachments.startTestClass(testIdentifier.getDisplayName());
            }
            if (testIdentifier.isTest()) {
                Attachments.startTestCase(String.join(" - ", scenarioParts.subList(2, scenarioParts.size())));
            }
            return;
        }
        if (testIdentifier.isTest()) {
            Attachments.startTestCase(transformReportingName(testIdentifier.getLegacyReportingName()));
        } else {
            testIdentifier.getSource().ifPresent(source -> {
                if (source instanceof ClassSource) {
                    Attachments.startTestClass(((ClassSource) source).getClassName());
                }
            });
        }
    }

    @Override
    public void executionFinished(TestIdentifier testIdentifier,
        TestExecutionResult testExecutionResult) {
        if (testIdentifier.getUniqueId().contains("engine:cucumber")) {
            scenarioParts.pop();
        }
        if (testIdentifier.isTest()) {
            Attachments.endTestCase(testExecutionResult.getThrowable().isPresent());
        } else {
            testIdentifier.getSource().ifPresent(source -> {
                if (source instanceof ClassSource) {
                    Attachments.endTestClass();
                }
            });
        }
    }
}
