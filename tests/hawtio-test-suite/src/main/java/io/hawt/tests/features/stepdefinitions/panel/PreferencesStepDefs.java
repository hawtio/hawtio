package io.hawt.tests.features.stepdefinitions.panel;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;
import io.cucumber.java.PendingException;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.pages.preferences.PreferencesPage;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selenide.$;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PreferencesStepDefs {
    private final PreferencesPage preferencesPage = new PreferencesPage();
    private static final Logger LOG = LoggerFactory.getLogger(PreferencesStepDefs.class);
    private static final By CONNECT_MAX_DEPTH = By.id("jolokia-form-max-depth-input");
    private static final By CONNECT_MAX_SIZE_INPUT = By.id("jolokia-form-max-collection-size-input");


    @When("^User is on \"([^\"]*)\" tab of Preferences page$")
    public void userIsOnTabOfPreferencesPage(String tabName) {
        preferencesPage.switchTab(tabName);
    }

    @Then("The content of Preferences page is open$")
    public void theContentOfPreferencesPageIsOpen() {
        preferencesPage.checkContent();
    }

    @When("User toggles the show vertical navigation field")
    public void userTogglesTheField() {
        $(By.cssSelector("main span.pf-v5-c-switch__toggle")).shouldBe(interactable).click();
    }

    @When("User clicks on Reset button")
    public void userClicksOnButton() {
         $(By.cssSelector("main button.pf-m-danger")).shouldBe(interactable).click();
    }

    @And("User confirms modal {string} resetting with confirmation {string} and clicks reset button {string}")
    public void userConfirmsModalAndClicksResetButton(String modalTestId, String expectedText, String buttonClass) {
        String modalSelector = String.format("[data-testid='%s']", modalTestId);
        // Ensure correct modal is present with expected text
        $(modalSelector)
            .shouldBe(visible)
            .shouldHave(text(expectedText));
        // Find and click the button within modal's footer
        $(By.cssSelector(".pf-v5-c-modal-box__footer")).$(buttonClass).shouldBe(visible, enabled).click();
    }

    @Then("User is presented with a successful alert message")
    public void userIsPresentedWithASuccessfullAlertMessage() {
        $(By.cssSelector("main .pf-v5-c-alert")).shouldBe(visible);
    }


    @When("User slides log level")
    public void userSlidesLogLevel() {
        SelenideElement thumb = $("div.pf-v5-c-slider__thumb");
        SelenideElement tickDebug = $("div.pf-v5-c-slider__step:nth-child(5) > div:nth-child(1)");
        SelenideElement tickOff = $("div.pf-v5-c-slider__step:nth-child(1) > div:nth-child(1)");
        Selenide.actions()
            .clickAndHold(thumb)
            .dragAndDrop(tickOff, tickDebug)
            .perform();
    }


    @Then("User adds child logger")
    public void userAddsChildLogger() {
        SelenideElement loggAddSvg = $("span.pf-v5-c-menu-toggle__controls:nth-child(2) > span:nth-child(1) > svg:nth-child(1)");
        loggAddSvg.click();
        final By childLogList = By.cssSelector(".pf-v5-c-menu__list");
        $(childLogList).$(byText("hawtio-camel")).click();
    }


    @And("User sees added child logger")
    public void userSeesAddedChildLogger() {
        $(".pf-v5-c-data-list__item-content").$(byText("hawtio-camel")).shouldBe(visible);
    }


    @And("User is able to delete child logger")
    public void userIsAbleToDeleteChildLogger() {
        $(".pf-v5-c-data-list__item-action > button:nth-child(1)").click();
    }

    @When("User changes Jolokia values")
    public void userChangesJolokiaValues() {
        //change max depth value
        $(CONNECT_MAX_DEPTH).clear();
        $(CONNECT_MAX_DEPTH).sendKeys("7");
       //change max collection size
        $(CONNECT_MAX_SIZE_INPUT).clear();
        $(CONNECT_MAX_SIZE_INPUT).sendKeys("50000");
    }

    @And("User applies effects of Jolokia values")
    public void userAppliesEffectsOfJolokiaValues() {
        $("button.pf-v5-c-button.pf-m-primary").click();
    }

    @Then("Change stays after reload")
    public void changeStaysAffterReload() {
        WebDriverRunner.getWebDriver().navigate().refresh();
        $(CONNECT_MAX_DEPTH).shouldBe(value("7"));
        $(CONNECT_MAX_SIZE_INPUT).shouldBe(value("50000"));
    }

    @Then("^Content section has h2 title \"([^\"]*)\"$")
    public void contentSectionHasHTitle(String title) {
        $("div .pf-v5-c-content h2").shouldHave(exactText(title));
    }
}
