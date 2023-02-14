package io.hawt.tests.utils.stepdefinitions.camel.contexts;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelChart;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelTypeConverters;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.utils.pageobjects.pages.camel.contexts.CamelSpecificContextPage;

public class CamelSpecificContextStepDefs {
    private final CamelPage camelPage = new CamelPage();
    private CamelAttributes camelAttributes;
    private CamelChart camelChart;
    private CamelOperations camelOperations;
    private CamelSpecificContextPage camelSpecificContextPage;
    private CamelTypeConverters camelTypeConverters;


    @And("^User is on Camel \"([^\"]*)\" context$")
    public void userIsOnCamelContextPage(String context) {
        camelSpecificContextPage = camelPage.camelTree().expandSpecificContext(CamelSpecificContextPage.class, context);
    }

    @When("^User clicks on Attributes tab of Camel Specific Context page$")
    public void userClicksOnAttributesTabOfCamelSpecificContextPage() {
        camelAttributes = camelSpecificContextPage.attributes();
    }

    @When("^User clicks on Operations tab of Camel Specific Context page$")
    public void userClicksOnOperationsTabOfCamelSpecificContextPage() {
        camelOperations = camelSpecificContextPage.operations();
    }

    @When("^User clicks on Chart tab of Camel Specific Context page$")
    public void userClicksOnChartTabOfCamelSpecificContextPage() {
        camelChart = camelSpecificContextPage.chart();
    }

    @When("^User clicks on Type Converters tab of Camel Specific Context page$")
    public void userClicksOnTypeConvertersTabOfCamelSpecificContextPage() {
        camelTypeConverters = camelSpecificContextPage.typeConverters();
    }

    @And("^User enables statistics on Type Converters tab of Camel Specific Context page$")
    public void userEnablesStatisticsOnTypeConvertersTabOfCamelSpecificContextPage() {
        camelTypeConverters.enableStatistics();
    }

    @When("^User sets suspend in the dropdown menu of Camel Specific Context$")
    public void userSetsSuspendInTheDropDownMenuOfCamelSpecificContext() {
        camelSpecificContextPage.setAction(CamelSpecificContextPage.ContextAction.SUSPEND)
            .successfulAlertMessage(CamelSpecificContextPage.class)
            .closeAlertMessage(CamelSpecificContextPage.class);
    }

    @When("^User sets start in the dropdown menu of Camel Specific Context$")
    public void userSetsStartInTheDropDownMenuOfCamelSpecificContext() {
        camelSpecificContextPage.setAction(CamelSpecificContextPage.ContextAction.START)
            .successfulAlertMessage(CamelSpecificContextPage.class)
            .closeAlertMessage(CamelSpecificContextPage.class);
    }

    @Then("^State of Camel Specific Context is \"([^\"]*)\"$")
    public void stateOfCamelSpecificContextIs(String state) {
        camelSpecificContextPage.checkState(state);
    }
}
