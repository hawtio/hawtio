package io.hawt.tests.features.stepdefinitions.camel;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.common.CamelChart;

public class CamelChartStepDefs {
    private final CamelChart camelChart = new CamelChart();

    @Then("^Camel Attribute \"([^\"]*)\" and its value \"([^\"]*)\" are displayed in Camel Chart$")
    public void camelAttributeAndItsValueAreDisplayedInCamelChart(String attribute, String value) {
        camelChart.checkSpecificAttributeIsDisplayed(attribute).checkStringAttributeValue(attribute, value);
    }

    @Then("^Camel Attribute \"([^\"]*)\" is not displayed in Camel Chart$")
    public void camelAttributeIsNotDisplayedInCamelChart(String attribute) {
        camelChart.checkSpecificAttributeIsNotDisplayed(attribute);
    }

    @When("^User switches to Edit watches mode of Camel Chart")
    public void userSwitchesToEditWatchesModeOfCamelChart() {
        camelChart.edit();
    }

    @When("^User unwatch all \"([^\"]*)\" attributes$")
    public void userUnwatchAllAttributes(String parentAttribute) {
        camelChart.unwatchAll(parentAttribute);
    }

    @When("^User watches \"([^\"]*)\" attribute$")
    public void userWatchesAnAttribute(String attribute) {
        camelChart.watch(attribute);
    }

    @When("^User closes Edit watches mode of Camel Chart$")
    public void userClosesEditWatchesModeOfCamelChart() {
        camelChart.closeEdit();
    }
}
