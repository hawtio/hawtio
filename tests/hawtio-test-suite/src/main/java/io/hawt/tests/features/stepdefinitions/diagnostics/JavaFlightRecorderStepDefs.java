package java.io.hawt.tests.features.stepdefinitions.diagnostics;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openjdk.jmc.flightrecorder.JfrLoaderToolkit;
import org.openjdk.jmc.flightrecorder.CouldNotLoadRecordingException;
import org.openqa.selenium.By;

import io.hawt.tests.features.openshift.WaitUtils;

import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selenide.$;

import java.time.Duration;
import java.io.File;
import java.io.IOException;

public class JavaFlightRecorderStepDefs {

    private static final String CONFIGURATION_NAME = "test";

    @When("User starts recording")
    public void userStartsRecording() {
        $(By.cssSelector(".flight-recorder-button-divider>.pf-v5-c-action-list>button:first-child")).shouldBe(interactable).click();
        WaitUtils.wait(Duration.ofSeconds(1));
    }

    @When("User stops recording")
    public void userStopsRecording() {
        $(By.cssSelector(".flight-recorder-button-divider>.pf-v5-c-action-list>button:nth-child(2)")).shouldBe(interactable).click();
    }

    @When("User sets configuration")
    public void userSetsConfiguration() {
        $(By.cssSelector(".flight-recorder-button-divider>.pf-v5-c-action-list>button:nth-child(3)")).shouldBe(interactable).click();

        $(By.cssSelector("input[aria-label='Recording Name']")).shouldBe(interactable).val(CONFIGURATION_NAME);
    }

    @Then("The recording is a valid jfr file")
    public void theRecordingIsAValidJfrFile() throws IOException, CouldNotLoadRecordingException {
        File downloadedFile = $(By.cssSelector(".pf-v5-c-table pf-m-primary")).download();
        
        JfrLoaderToolkit.loadEvents(downloadedFile);
    }

    @Then("The recording has user configuration applied")
    public void theRecordingHasUserConfigurationapplied() {
        File downloadedFile = $(By.cssSelector(".pf-v5-c-table pf-m-primary")).download();

        assert downloadedFile.getName() == CONFIGURATION_NAME;
    }

}
