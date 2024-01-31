package io.hawt.tests.openshift.utils;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;

import com.codeborne.selenide.Selenide;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import io.hawt.tests.utils.rp.Attachments;

public class SelenideTestWatcher implements TestWatcher {

    @Override
    public void testAborted(ExtensionContext context, Throwable cause) {
        takeScreenshot(context);
    }

    private static void takeScreenshot(ExtensionContext context) {
        var screenshot = URLDecoder.decode(Selenide.screenshot(context.getRequiredTestClass().getName() + "." + context.getRequiredTestMethod().getName()),
            StandardCharsets.UTF_8);
        context.publishReportEntry("screenshot", screenshot);
        Attachments.addAttachment(Path.of(screenshot.substring("file:".length())));
    }

    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        takeScreenshot(context);
    }
}
