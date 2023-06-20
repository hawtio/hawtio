package io.hawt.tests.features.hooks;

import org.openqa.selenium.OutputType;

import com.codeborne.selenide.Selenide;

import io.cucumber.java.AfterStep;
import io.cucumber.java.Scenario;

public class ScreenshotHook {


    @AfterStep
    public void afterStep(Scenario scenario) {
        if (scenario.isFailed()) {
            scenario.attach(Selenide.screenshot(OutputType.BYTES), "image/png", "screenshot");
        }
    }
}
