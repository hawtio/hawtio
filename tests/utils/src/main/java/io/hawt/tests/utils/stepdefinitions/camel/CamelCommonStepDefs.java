package io.hawt.tests.utils.stepdefinitions.camel;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.Table;
import io.hawt.tests.utils.pageobjects.fragments.camel.dialog.CamelAttributeDetailDialog;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelChart;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelProperties;

public class CamelCommonStepDefs {
    private final CamelAttributes camelAttributes = new CamelAttributes();
    private final CamelChart camelChart = new CamelChart();
    private final CamelOperations camelOperations = new CamelOperations();
    private final CamelProperties camelProperties = new CamelProperties();
    private final Table table = new Table();
    private CamelAttributeDetailDialog camelAttributeDetailDialog;

    @Then("^Camel Attributes table with \"([^\"]*)\" column is presented$")
    public void camelAttributesTableWithColumnIsPresented(String column) {
        table.getColumn(column).shouldBe(sizeGreaterThanOrEqual(1));
    }

    @When("^User opens Attribute detail dialog with the name \"([^\"]*)\"$")
    public void userOpenAttributeDetailDialogWithTheName(String attributeName) {
        camelAttributeDetailDialog = camelAttributes.openAttributeDetailDialogByAttributeName(attributeName);
    }

    @Then("^The value of attribute in Attribute detail dialog is \"([^\"]*)\"$")
    public void valueOfAttributeIsAttributeDetailDialogIs(String attributeValue) {
        camelAttributeDetailDialog.checkValue(attributeValue).closeTheDetailDialog();
    }

    @Then("^Defined and undefined properties are displayed$")
    public void definedAndUndefinedPropertiesAreDisplayed() {
        camelProperties.checkDefinedPropertyAttributes()
            .checkUndefinedPropertyAttributes();
    }

    @When("^User executes operation with name \"([^\"]*)\"$")
    public void userExecutesOperationWithName(String method) {
        camelOperations.executeMethod(method);
    }

    @Then("^Result of \"([^\"]*)\" operation is \"([^\"]*)\"$")
    public void resultOfExecutedOperationIs(String operation, String result) {
        camelOperations.checkResultOfExecutedOperation(operation, result);
    }

    @Then("^Camel Attribute \"([^\"]*)\" is displayed in Chart of Camel page$")
    public void camelAttributeIsDisplayedInChartOfCamelPage(String attributeName) {
        camelChart.checkSpecificAttributeIsDisplayed(attributeName);
    }

    @Then("^Camel Attribute \"([^\"]*)\" and its value \"([^\"]*)\" are displayed in Chart of Camel page$")
    public void camelAttributeAndItsValuesAreDisplayedInChartOfCamelPage(String attributeName, String attributeValue) {
        camelChart.checkSpecificAttributeIsDisplayed(attributeName).checkStringAttributeValue(attributeName, attributeValue);
    }

    @When("^User switches to Edit chart mode of Camel page$")
    public void userSwitchesToEditChartModeOfCamelPage() {
        camelChart.edit();
    }

    @When("^User edits the chart of Camel page by attribute \"([^\"]*)\"$")
    public void userEditsChartOfCamelPage(String attribute) {
        camelChart.selectChart(attribute).viewChart();
    }
}
