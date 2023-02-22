package io.hawt.tests.utils.stepdefinitions.camel.endpoints;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelChart;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelChartEdit;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints.CamelEndpoints;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.utils.pageobjects.pages.camel.endpoints.CamelEndpointsPage;

public class CamelEndpointsStepDefs {
    private final CamelChartEdit camelChartEdit = new CamelChartEdit();
    private final CamelPage camelPage = new CamelPage();
    private CamelAttributes camelAttributes;
    private CamelChart camelChart;
    private CamelEndpointsPage camelEndpointsPage;
    private CamelEndpoints camelEndpoints;

    @And("^User is on Camel Endpoints folder of \"([^\"]*)\" context$")
    public void userIsOnCamelEndpointsPage(String context) {
        camelEndpointsPage = camelPage.camelTree()
            .expandSpecificContext(CamelTree.class, context)
            .expandSpecificFolder(CamelEndpointsPage.class, "endpoints");
    }

    @When("^User clicks on Attributes tab of Camel Endpoints page$")
    public void userClicksOnAttributesTabOfCamelEndpointsPage() {
        camelAttributes = camelEndpointsPage.attributes();
    }

    @When("^User clicks on Endpoints tab of Camel Endpoints page$")
    public void userClicksOnEndpointsTabOfCamelEndpointsPage() {
        camelEndpoints = camelEndpointsPage.endpoints();
    }

    @When("^User clicks on Chart tab of Camel Endpoints page$")
    public void userClicksOnChartTabOfCamelEndpointsPage() {
        camelChart = camelEndpointsPage.chart();
    }

    @Then("^Camel Endpoints table with \"([^\"]*)\" column is presented$")
    public void camelEndpointsTableWithColumnIsPresented(String column) {
        camelEndpoints.checkTableNotEmpty(column);
    }

    @When("^User adds Endpoint \"([^\"]*)\" from URI$")
    public void userAddsEndpointFromUri(String endpointUri) {
        camelEndpoints.add()
            .fromUri(endpointUri);
    }

    @When("^User edits \"([^\"]*)\" of the chart of Camel page by attribute \"([^\"]*)\"$")
    public void userEditsChartOfCamelPage(String element, String attribute) {
        camelChartEdit.selectChart(element, attribute).viewChart();
    }

    @And("^Successful message in Camel Endpoints is appeared and closed$")
    public void successfulMessageInCamelEndpointsIsAppearedAndClosed() {
        camelEndpoints.successfulAlertMessage(CamelEndpointsPage.class)
            .closeAlertMessage(CamelEndpointsPage.class);
    }

    @Then("^Endpoint URI \"([^\"]*)\" is added into Attributes table$")
    public void endpointIsAddedIntoAttributesTable(String endpointUri) {
        camelEndpointsPage.attributes().checkAddedEndpoint(endpointUri);
    }
}
