package io.hawt.tests.features.stepdefinitions.camel;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.fragments.camel.panel.CamelAttributeDetailsPanel;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.common.CamelChart;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

public class CommonCamelStepDefs {
    private final CamelPage camelPage = new CamelPage();
    private final CamelAttributes camelAttributes = new CamelAttributes();
    private final CamelAttributeDetailsPanel camelAttributeDetailsPanel = new CamelAttributeDetailsPanel();
    private final CamelChart camelChart = new CamelChart();
    private final CamelOperations camelOperations = new CamelOperations();
    private String result;

    @When("^User clicks on Camel \"([^\"]*)\" tab$")
    public void userClicksOnCamelTab(String tab) {
        camelPage.openTab(tab);
    }

    @When("^User expands Attribute details with the name \"([^\"]*)\"$")
    public void userExpandsAttributeDetailsWithTheName(String attributeName) {
        camelAttributes.expandAttributeDetailsByAttributeName(attributeName);
    }

    @Then("^Camel Attribute details have \"([^\"]*)\" key and \"([^\"]*)\" value$")
    public void keyAndValueOfAttributeDetailsAre(String key, String value) {
        camelAttributeDetailsPanel.checkValue(key, value).closeAttributeDetailsPanel();
    }

    @When("^User executes operation with name \"([^\"]*)\"$")
    public void userExecutesOperationWithName(String method) {
        camelOperations.executeMethod(method);
    }

    @Then("^Result of \"([^\"]*)\" operation is \"([^\"]*)\"$")
    public void resultOfExecutedOperationIs(String operation, String result) {
        camelOperations.checkResultOfExecutedOperation(operation, result);
    }

    @When("^The result of the \"([^\"]*)\" operation is stored$")
    public void theResultOfOperationIsStored(String operation) {
        result = camelOperations.getResultOfExecutedOperation(operation);
    }

    @Then("^Camel Attribute \"([^\"]*)\" has the same value as stored one$")
    public void camelAttributeHasTheSameValueAsStoredOne(String attribute) {
        camelChart.checkSpecificAttributeIsDisplayed(attribute).checkStringAttributeValue(attribute, result);
    }
}
