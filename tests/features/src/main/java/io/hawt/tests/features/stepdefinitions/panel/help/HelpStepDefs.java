package io.hawt.tests.features.stepdefinitions.panel.help;

import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.WebDriverRunner.url;
import static org.junit.Assert.assertTrue;

import com.codeborne.selenide.Selenide;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.pages.panel.help.HelpPage;

public class HelpStepDefs {
    private final HelpPage helpPage = new HelpPage();

    @When("^User is on \"([^\"]*)\" tab of Help page$")
    public void userClicksOnTabOfHelpPage(String tabName) {
        helpPage.switchTab(tabName);
    }

    @When("^User clicks on \"([^\"]*)\" link text$")
    public void userClicksOnLinkText(String linkText) {
        $(byLinkText(linkText)).shouldBe(interactable).click();
    }

    @Then("^User is redirected to the \"([^\"]*)\"$")
    public void userIsRedirectedToTheUrl(String testedUrl) {
        assertTrue(url().contains(testedUrl));
    }

    @And("^User is returned to the previous page$")
    public void userIsReturnedToPreviousPage() {
        Selenide.back();
    }

    @Then("^The content of Help page is present$")
    public void theContentOfHelpPageIsPresent() {
        helpPage.checkContent();
    }
}
