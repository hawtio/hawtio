package io.hawt.tests.utils.stepdefinitions.camel;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.Table;
import io.hawt.tests.utils.pageobjects.fragments.camel.dialog.CamelAttributeDetailDialog;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

public class CommonCamelStepDefs {
    private final CamelPage camelPage = new CamelPage();
    private final CamelAttributes camelAttributes = new CamelAttributes();
    private final CamelAttributeDetailDialog camelAttributeDetailDialog = new CamelAttributeDetailDialog();
    private final CamelOperations camelOperations = new CamelOperations();
    private final Table table = new Table();

    @When("^User clicks on Camel \"([^\"]*)\" tab$")
    public void userClicksOnCamelTab(String tab) {
        camelPage.openTab(tab);
    }

    @Then("^Camel table \"([^\"]*)\" column is not empty$")
    public void camelTableColumnIsPresented(String column) {
        table.checkColumnIsNotEmpty(column);
    }

    @Then("^Camel table has \"([^\"]*)\" key and \"([^\"]*)\" value$")
    public void camelTableHasKeyAndValue(String key, String value) {
        table.checkKeyAndValuePairs(key, value);
    }

    @When("^User opens Attribute detail dialog with the name \"([^\"]*)\"$")
    public void userOpenAttributeDetailDialogWithTheName(String attributeName) {
        camelAttributes.openAttributeDetailDialogByAttributeName(attributeName);
    }

    @Then("^Camel Attribute Detail Dialog has \"([^\"]*)\" key and \"([^\"]*)\" value$")
    public void valueOfAttributeIsAttributeDetailDialogIs(String key, String value) {
        camelAttributeDetailDialog.checkValue(key, value).closeAttributeDetailDialog();
    }

    @When("^User executes operation with name \"([^\"]*)\"$")
    public void userExecutesOperationWithName(String method) {
        camelOperations.executeMethod(method);
    }

    @Then("^Result of \"([^\"]*)\" operation is \"([^\"]*)\"$")
    public void resultOfExecutedOperationIs(String operation, String result) {
        camelOperations.checkResultOfExecutedOperation(operation, result);
    }
}
