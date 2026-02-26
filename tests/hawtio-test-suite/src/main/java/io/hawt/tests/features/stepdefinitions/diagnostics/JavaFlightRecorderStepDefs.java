package io.hawt.tests.features.stepdefinitions.diagnostics;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.By;

import io.hawt.tests.features.openshift.WaitUtils;
import io.hawt.tests.features.pageobjects.pages.diagnostics.DiagnosticsPage; 

import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selenide.$;

import java.time.Duration;

public class JavaFlightRecorderStepDefs {

    private static final String CONFIGURATION_NAME = "test";
    private final DiagnosticsPage page = new DiagnosticsPage();

    @When("User starts recording")
    public void userStartsRecording() {
        $(By.cssSelector(".flight-recorder-button-divider .pf-v5-c-action-list button:first-child")).shouldBe(interactable).click();
        WaitUtils.wait(Duration.ofSeconds(1));
    }

    @When("User stops recording")
    public void userStopsRecording() {
        $(By.cssSelector(".flight-recorder-button-divider .pf-v5-c-action-list button:nth-child(2)")).shouldBe(interactable).click();
    }

    @When("User sets configuration")
    public void userSetsConfiguration() {
        $(By.cssSelector(".flight-recorder-button-divider .pf-v5-c-action-list button:nth-child(4)")).shouldBe(interactable).click();
        $(By.cssSelector("input")).shouldBe(interactable).val("test");
        $(By.cssSelector("button[aria-label='Close']")).click();
    }

    @Then("The recording is a valid jfr file")
    public void theRecordingIsAValidJfrFile() {
        $(By.cssSelector(".pf-v5-c-table .pf-m-primary")).shouldBe(interactable);
    }

    @Then("The recording has user configuration applied")
    public void theRecordingHasUserConfigurationapplied() {
        $(By.cssSelector(".pf-v5-c-table .pf-m-primary")).shouldBe(interactable);

        $(By.cssSelector(".pf-v5-c-table__tr td:nth-child(2)")).equals(CONFIGURATION_NAME);
    }
}
