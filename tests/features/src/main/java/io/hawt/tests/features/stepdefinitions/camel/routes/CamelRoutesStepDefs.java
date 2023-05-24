package io.hawt.tests.features.stepdefinitions.camel.routes;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelRouteDiagram;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelRoutes;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelSource;

public class CamelRoutesStepDefs {
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
}
