package io.hawt.tests.features.stepdefinitions.camel.routes;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelDebug;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelRouteDiagram;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelRoutes;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelSource;

public class CamelRoutesStepDefs {
    private final CamelDebug camelDebug = new CamelDebug();
    private final CamelRoutes camelRoutes = new CamelRoutes();
    private final CamelRouteDiagram camelRouteDiagram = new CamelRouteDiagram();
    private final CamelSource camelSource = new CamelSource();

    @When("^User clicks on Delete button in dropdown in routes table$")
    public void userClicksOnDeleteButtonRoutesTable() {
        camelRoutes.delete();
    }

    @When("^User confirms deletion on Camel Routes page$")
    public void userConfirmsDeletionCamelContextsPage() {
        camelRoutes.confirm()
            .successfulAlertMessage()
            .closeAlertMessage();
    }

    @Then("^Camel Route diagram is presented$")
    public void camelRouteDiagramIsPresented() {
        camelRouteDiagram.diagramIsPresent();
    }

    @Then("^Route source code is presented$")
    public void routeSourceCodeIsPresented() {
        camelSource.routeSourceCodeIsPresented();
    }

    @When("^User adds breakpoint on \"([^\"]*)\" node$")
    public void userAddsBreakpointOnNode(String node) {
        camelDebug.addBreakpoint(node);
    }

    @When("^User removes breakpoint on \"([^\"]*)\" node$")
    public void userRemovesBreakpointOnNode(String node) {
        camelDebug.removeBreakpoint(node);
    }

    @Then("^Breakpoint sign on \"([^\"]*)\" node is set: \"([^\"]*)\"$")
    public void breakpointSignIsSet(String node, String state) {
        camelDebug.breakpointSignIsSet(node, state);
    }

    @When("^User starts debugging$")
    public void userStartsDebugging() {
        camelDebug.startDebugging();
    }

    @Then("^Debugging is started$")
    public void debuggingIsStarted() {
        camelDebug.debuggingIsStarted();
    }

    @When("^User stops debugging$")
    public void userStopsDebugging() {
        camelDebug.stopDebugging();
    }

    @Then("^Start debugging option is presented$")
    public void startDebuggingOptionIsPresented() {
        camelDebug.startDebuggingOptionIsPresented();
    }
}
