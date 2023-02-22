package io.hawt.tests.utils.stepdefinitions.camel.routes;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes.CamelRouteDiagram;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes.CamelRoutes;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.utils.pageobjects.pages.camel.routes.CamelRoutesPage;

public class CamelRoutesStepDefs {
    private final CamelPage camelPage = new CamelPage();
    private CamelRouteDiagram camelRouteDiagram = new CamelRouteDiagram();
    private CamelRoutes camelRoutes;
    private CamelRoutesPage camelRoutesPage;

    @And("^User is on Camel Routes folder of \"([^\"]*)\" context$")
    public void userIsOnCamelRoutesPage(String context) {
        camelRoutesPage = camelPage.camelTree()
            .expandSpecificContext(CamelTree.class, context)
            .expandSpecificFolder(CamelRoutesPage.class, "routes");
    }

    @And("^User selects \"([^\"]*)\" route from the table$")
    public void userSelectsRouteFromTable(String route) {
        camelRoutes = camelRoutesPage.routes().selectRoute(route);
    }

    @When("^The \"([^\"]*)\" route is in \"([^\"]*)\" state$")
    public void routeIsInStartedState(String route, String state) {
        if (!state.contains(camelRoutes.getRouteState(route).getText())) {
            camelRoutes.changeState(state)
                .successfulAlertMessage(CamelRoutes.class)
                .closeAlertMessage(CamelRoutes.class);
        }
    }

    @Then("^The delete button should be disabled$")
    public void deleteButtonShouldBeDisabled() {
        camelRoutes.checkDeleteButtonIsDisabled();
    }

    @Then("^The \"([^\"]*)\" route should have \"([^\"]*)\" state$")
    public void routeShouldHasStoppedState(String route, String state) {
        camelRoutes.checkRouteState(route, state);
    }

    @When("^User clicks on Delete button in dropdown in routes table$")
    public void userClicksOnDeleteButtonRoutesTable() {
        camelRoutes.delete();
    }

    @When("^User confirms deletion on Camel Routes page$")
    public void userConfirmsDeletionCamelContextsPage() {
        camelRoutes.confirm()
            .successfulAlertMessage(CamelRoutes.class)
            .closeAlertMessage(CamelRoutes.class);
    }

    @Then("^The \"([^\"]*)\" route should not be in the table anymore$")
    public void routeShouldNotBeInTable(String route) {
        camelRoutes.checkRouteIsNotInTable(route);
    }

    @When("^User clicks on Routes tab of Camel Routes page$")
    public void userClicksOnRoutesTabOfCamelRoutesPage() {
        camelRoutes = camelRoutesPage.routes();
    }

    @Then("^Camel Routes table is presented$")
    public void camelRoutesTableWithColumnIsPresented() {
        camelRoutes.checkRoutesTableIsNotEmpty();
    }

    @When("^User clicks on Route Diagram tab of Camel Routes page$")
    public void userClicksOnRouteDiagramTabOfCamelRoutesPage() {
        camelRouteDiagram = camelRoutesPage.routeDiagram();
    }

    @Then("^Camel Route diagram is presented$")
    public void camelRouteDiagramIsPresented() {
        camelRouteDiagram.diagramIsPresent();
    }
}
