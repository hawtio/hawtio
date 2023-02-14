package io.hawt.tests.utils.stepdefinitions.camel.contexts;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.utils.pageobjects.pages.camel.contexts.CamelContextsPage;

public class CamelContextsStepDefs {
    private final CamelPage camelPage = new CamelPage();
    private CamelContextsPage camelContextsPage = new CamelContextsPage();

    @And("^User is on Camel Contexts page$")
    public void userIsOnCamelContextsPage() {
        camelContextsPage = camelPage.camelTree().expandSpecificFolder(CamelContextsPage.class, "camel-context");
    }

    @When("^User selects \"([^\"]*)\" context from the table$")
    public void userSelectsContextFromTable(String context) {
        camelContextsPage.selectContext(context);
    }

    @And("^The \"([^\"]*)\" context is started$")
    public void theContextIsStarted(String context) {
        if (!camelContextsPage.hasState(context, "Started")) {
            camelContextsPage.start();
        }
    }

    @And("^The \"([^\"]*)\" context is suspended")
    public void theContextIsSuspended(String context) {
        if (!camelContextsPage.hasState(context, "Suspended")) {
            camelContextsPage.suspend();
        }
    }

    @When("^User clicks on Suspend button in Contexts$")
    public void userClicksOnSuspendButtonInContexts() {
        camelContextsPage.suspend()
            .successfulAlertMessage(CamelContextsPage.class)
            .closeAlertMessage(CamelContextsPage.class);
    }

    @When("^User clicks on Start button in Contexts$")
    public void userClicksOnStartButtonInContexts() {
        camelContextsPage.start()
            .successfulAlertMessage(CamelContextsPage.class)
            .closeAlertMessage(CamelContextsPage.class);
    }

    @Then("^Camel \"([^\"]*)\" context has \"([^\"]*)\" state$")
    public void camelContextHasState(String context, String state) {
        camelContextsPage.hasState(context, state);
    }
}
