package io.hawt.tests.utils.stepdefinitions.camel.routes;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelChart;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelProperties;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes.CamelDebug;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes.CamelRouteDiagram;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.utils.pageobjects.pages.camel.routes.CamelSpecificRoutePage;

public class CamelSpecificRouteStepDefs {
    private final CamelPage camelPage = new CamelPage();
    private CamelRouteDiagram camelRouteDiagram = new CamelRouteDiagram();
    private CamelAttributes camelAttributes;
    private CamelChart camelChart;
    private CamelDebug camelDebug;
    private CamelProperties camelProperties;
    private CamelOperations camelOperations;
    private CamelSpecificRoutePage camelSpecificRoutePage;

    @And("^User is on Camel \"([^\"]*)\" node of Routes folder of \"([^\"]*)\" context$")
    public void userIsOnCamelSpecificRoutePageOfSpecificContext(String node, String context) {
        camelSpecificRoutePage = camelPage.camelTree()
            .expandSpecificContext(CamelTree.class, context)
            .expandSpecificFolder(CamelTree.class, "routes")
            .selectSpecificNode(CamelSpecificRoutePage.class, node, "routes", context);
    }

    @When("^User clicks on Chart tab of Camel Specific Route page$")
    public void userClicksOnChartTabOfCamelSpecificRoutePage() {
        camelChart = camelSpecificRoutePage.chart();
    }

    @And("^User clicks on Debug tab of Camel Specific Route page$")
    public void userClicksOnDebugTabOfCamelSpecificRoutePage() {
        camelDebug = camelSpecificRoutePage.debug();
    }

    @And("^User clicks on Properties tab of Camel Specific Route page$")
    public void userClicksOnPropertiesTabOfCamelSpecificRoutePage() {
        camelProperties = camelSpecificRoutePage.properties();
    }

    @When("^User clicks on Start debugging button$")
    public void userClicksOnStartDebuggingButton() {
        camelDebug.startDebugging();
    }

    @When("^User adds breakpoint on \"([^\"]*)\" node$")
    public void userAddsBreakpointOnNode(String nodeId) {
        camelDebug.addBreakpoint(nodeId);
    }

    @Then("^The breakpoint sign is appearing on \"([^\"]*)\" node$")
    public void theBreakpointSignIsAppearingOnNode(String nodeId) {
        camelDebug.checkBreakpointIsPresent(nodeId);
    }

    @When("^User removes breakpoint from \"([^\"]*)\" node$")
    public void userRemovesBreakpointFromNode(String nodeId) {
        camelDebug.removeBreakpoint(nodeId);
    }

    @Then("^The breakpoint sign is NOT appearing on \"([^\"]*)\" node$")
    public void theBreakpointSignIsNOTAppearingOnNode(String nodeId) {
        camelDebug.checkBreakpointIsNotPresent(nodeId);
    }

    @When("^User clicks on Stop debugging button$")
    public void userClicksOnStopDebuggingButton() {
        camelDebug.stopDebugging();
    }

    @Then("^The debugging is stopped$")
    public void theDebuggingIsStopped() {
        camelDebug.checkDebuggingIsStopped();
    }

    @When("^User clicks on Attributes tab of Camel Specific Route page$")
    public void userClicksOnAttributesTabOfCamelSpecificRoutePage() {
        camelAttributes = camelSpecificRoutePage.attributes();
    }

    @When("^User clicks on Operations tab of Camel Specific Route page$")
    public void userClicksOnOperationsTabOfCamelSpecificRoutePage() {
        camelOperations = camelSpecificRoutePage.operations();
    }

    @When("^User clicks on Route Diagram tab of Camel Specific Route page$")
    public void userClicksOnRouteDiagramTabOfCamelSpecificRoutePage() {
        camelRouteDiagram = camelSpecificRoutePage.routeDiagram();
    }

    @Then("^Defined, default and undefined properties are displayed$")
    public void definedDefaultAndUndefinedPropertiesAreDisplayed() {
        camelProperties.checkDefinedPropertyAttributes()
            .checkDefaultPropertyAttributes()
            .checkUndefinedPropertyAttributes();
    }

    @When("^User sets stop in the dropdown menu of Camel Specific Route$")
    public void userSetsStopInTheDropDownMenuOfCamelSpecificRoute() {
        camelSpecificRoutePage.setStop()
            .successfulAlertMessage(CamelSpecificRoutePage.class)
            .closeAlertMessage(CamelSpecificRoutePage.class);
    }

    @Then("^State of Camel Specific Route is \"([^\"]*)\"$")
    public void stateOfCamelSpecificRouteIs(String state) {
        camelSpecificRoutePage.checkState(state);
    }
}
