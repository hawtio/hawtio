package io.hawt.tests.features.hooks;

import org.openqa.selenium.OutputType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Selenide;

import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import io.cucumber.java.AfterStep;
import io.cucumber.java.Scenario;
import io.hawt.tests.features.utils.Attachments;

public class ScreenshotHook {

    private static final Logger LOG = LoggerFactory.getLogger(ScreenshotHook.class);

    @AfterStep
    public void afterStep(Scenario scenario) {
        if (scenario.isFailed()) {
            try {
                scenario.attach(Selenide.screenshot(OutputType.BYTES), "image/png", "screenshot");
                addScreenshotToReport(scenario.getName());
            } catch (Exception e) {
                LOG.error("Failed to take a screenshoot", e);
            }
        }
    }

    public static void addScreenshotToReport(String name) {
        try {
            Attachments.addAttachment(Path.of(new URL(URLDecoder.decode(Selenide.screenshot(name), StandardCharsets.UTF_8)).getPath()));
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }
}
