package io.hawt.tests.features.stepdefinitions.panel;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.pages.preferences.PreferencesPage;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import static com.codeborne.selenide.Condition.*;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.sleep;

public class PreferencesStepDefs {
    private final PreferencesPage preferencesPage = new PreferencesPage();
    
    private static final By CONNECT_MAX_DEPTH = By.id("jolokia-form-max-depth-input");
    private static final By CONNECT_MAX_SIZE_INPUT = By.id("jolokia-form-max-collection-size-input");
    private static final By CAMEL_MAX_LABEL_WIDTH = By.id("camel-form-maximum-label-width-input");
    private static final By SERVER_LOGS_CACHE_SIZE = By.id("logs-form-log-cache-size-input");
    private static final By JMX_SERIALIZE_LONG = By.id("serialize-long-to-string-input"); // ADDED THIS

    @When("^User is on \"([^\"]*)\" tab of Preferences page$")
    public void userIsOnTabOfPreferencesPage(String tabName) {
        String actualTabName = tabName.equalsIgnoreCase("Jolokia") ? "Connect" : tabName;
        preferencesPage.switchTab(actualTabName);
        sleep(500); 
    }

    @Then("The content of Preferences page is open$")
    public void theContentOfPreferencesPageIsOpen() {
        preferencesPage.checkContent();
    }

    // --- Home Logic ---
    @When("User toggles the show vertical navigation field")
    public void userTogglesTheField() {
        $(By.cssSelector("main span.pf-v6-c-switch__toggle")).shouldBe(interactable).click();
    }

    @When("User clicks on Reset button")
    public void userClicksOnButton() {
         $(By.cssSelector("main button.pf-m-danger")).shouldBe(interactable).click();
    }

    @And("User confirms modal {string} resetting with confirmation {string} and clicks reset button {string}")
    public void userConfirmsModalAndClicksResetButton(String modalTestId, String expectedText, String buttonClass) {
        String modalSelector = String.format("[data-testid='%s']", modalTestId);
        $(modalSelector).shouldBe(visible).shouldHave(text(expectedText));
        $(By.cssSelector(".pf-v6-c-modal-box__footer")).$(buttonClass).shouldBe(visible, enabled).click();
    }

    @Then("User is presented with a successful alert message")
    public void userIsPresentedWithASuccessfullAlertMessage() {
        $(By.cssSelector(".pf-v6-c-alert")).shouldBe(visible);
    }

    // --- Jolokia Logic ---
    @When("User changes Jolokia values")
    public void userChangesJolokiaValues() {
        $(CONNECT_MAX_DEPTH).shouldBe(visible).clear();
        $(CONNECT_MAX_DEPTH).sendKeys("7", Keys.TAB);
        $(CONNECT_MAX_SIZE_INPUT).shouldBe(visible).clear();
        $(CONNECT_MAX_SIZE_INPUT).sendKeys("50000", Keys.TAB);
    }

    @And("User applies effects of Jolokia values")
    public void userAppliesEffectsOfJolokiaValues() {
        $("button.pf-v6-c-button.pf-m-primary").shouldBe(enabled).click();
    }

    @Then("Change stays after reload")
    public void changeStaysAfterReload() {
        WebDriverRunner.getWebDriver().navigate().refresh();
        $(CONNECT_MAX_DEPTH).shouldBe(visible).shouldHave(value("7"));
        $(CONNECT_MAX_SIZE_INPUT).shouldHave(value("50000"));
    }

    // --- Camel Logic ---
    @When("User changes Camel values")
    public void userChangesCamelValues() {
        $(CAMEL_MAX_LABEL_WIDTH).shouldBe(visible).clear();
        $(CAMEL_MAX_LABEL_WIDTH).sendKeys("40", Keys.ENTER);
    }

    @Then("Camel change stays after reload")
    public void camelChangeStaysAfterReload() {
        WebDriverRunner.getWebDriver().navigate().refresh();
        $(CAMEL_MAX_LABEL_WIDTH).shouldBe(visible).shouldHave(value("40"));
    }

    // --- Server Logs Logic ---
    @When("User changes Server Logs values")
    public void userChangesServerLogsValues() {
        $(SERVER_LOGS_CACHE_SIZE).shouldBe(visible).clear();
        $(SERVER_LOGS_CACHE_SIZE).sendKeys("1000", Keys.ENTER);
    }

    @Then("Server Logs change stays after reload")
    public void serverLogsChangeStaysAfterReload() {
        WebDriverRunner.getWebDriver().navigate().refresh();
        $(SERVER_LOGS_CACHE_SIZE).shouldBe(visible).shouldHave(value("1000"));
    }

    // --- JMX Logic ---
    @When("User views JMX preference options")
    public void user_views_jmx_preference_options() {
        $(JMX_SERIALIZE_LONG).shouldBe(visible).click();
    }

    @Then("JMX preferences are loaded correctly")
    public void jmx_preferences_are_loaded_correctly() {
        WebDriverRunner.getWebDriver().navigate().refresh();
        $(JMX_SERIALIZE_LONG).shouldBe(visible);
    }

    @Then("^Content section has h2 title \"([^\"]*)\"$")
    public void contentSectionHasHTitle(String title) {
        $("main h1, main h2, .pf-v6-c-title").shouldHave(text(title));
    }

    // --- Console Logs Logic ---
    @When("User slides log level")
    public void userSlidesLogLevel() {
        SelenideElement thumb = $("div.pf-v6-c-slider__thumb").shouldBe(visible);
        SelenideElement tickDebug = $("div.pf-v6-c-slider__step:nth-child(5)");
        Selenide.actions().clickAndHold(thumb).dragAndDrop(thumb, tickDebug).perform();
    }

    @Then("User adds child logger")
    public void userAddsChildLogger() {
        preferencesPage.clickToggleButton("Add");
        $(By.cssSelector(".pf-v6-c-menu__list")).shouldBe(visible).$(byText("hawtio-camel")).click();
    }

    @And("User sees added child logger")
    public void userSeesAddedChildLogger() {
        $(".pf-v6-c-data-list__item-content").$(byText("hawtio-camel")).shouldBe(visible);
    }

    @And("User is able to delete child logger")
    public void userIsAbleToDeleteChildLogger() {
        $(".pf-v6-c-data-list__item-action > button").click();
    }
}