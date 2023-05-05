package io.hawt.tests.utils.stepdefinitions.camel.contexts;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.pages.camel.contexts.CamelContextsPage;

public class CamelContextsStepDefs {
    private final CamelContextsPage camelContextsPage = new CamelContextsPage();

    @When("^User selects \"([^\"]*)\" context in Contexts$")
    public void userSelectContextsInContexts(String context) {
        camelContextsPage.selectContext(context);
    }

    @And("^User clicks on \"([^\"]*)\" button in Contexts$")
    public void userClicksOnSuspendButtonInContexts(String action) {
        camelContextsPage.clickButton(action)
            .successfulAlertMessage()
            .closeAlertMessage();
    }

    @Then("^Camel \"([^\"]*)\" context has \"([^\"]*)\" state$")
    public void camelContextHasState(String context, String state) {
        camelContextsPage.hasState(context, state);
    }
}
