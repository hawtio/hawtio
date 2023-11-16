package io.hawt.tests.openshift.utils;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;

import com.codeborne.selenide.Selenide;

public class SelenideTestWatcher implements TestWatcher {

    @Override
    public void testAborted(ExtensionContext context, Throwable cause) {
        takeScreenshot(context);
    }

    private static void takeScreenshot(ExtensionContext context) {
        var screenshot = Selenide.screenshot(context.getRequiredTestClass().getName() + "#" + context.getRequiredTestMethod().getName());
        context.publishReportEntry("screenshot", screenshot);
    }

    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        takeScreenshot(context);
    }
}
