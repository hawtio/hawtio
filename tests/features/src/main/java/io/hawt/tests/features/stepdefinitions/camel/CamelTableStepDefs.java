package io.hawt.tests.features.stepdefinitions.camel;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.text;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.fragments.Table;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

public class CamelTableStepDefs {
    private final CamelPage camelPage = new CamelPage();
    private final Table table = new Table();

    @Then("^Camel table \"([^\"]*)\" column is not empty$")
    public void camelTableColumnIsPresented(String column) {
        table.checkColumnIsNotEmpty(column);
    }

    @Then("^Camel table has \"([^\"]*)\" key and \"([^\"]*)\" value$")
    public void camelTableHasKeyAndValue(String key, String value) {
        table.checkKeyAndValuePairs(key, value);
    }

    @When("^User selects \"([^\"]*)\" item in Camel table")
    public void userSelectItemInCamelTable(String item) {
        camelPage.selectContext(item);
    }

    @And("^User clicks on \"([^\"]*)\" button in Camel table")
    public void userClicksOnActionButtonInCamelTable(String action) {
        camelPage.clickButton(action)
            .successfulAlertMessage()
            .closeAlertMessage();
    }

    @Then("^Camel \"([^\"]*)\" item has \"([^\"]*)\" state in Camel table$")
    public void camelItemHasStateInCamelTable(String item, String state) {
        camelPage.hasState(item, state);
    }

    @Then("^Camel \"([^\"]*)\" item searched by \"([^\"]*)\" is not in Camel table$")
    public void camelItemIsNotInCamelTable(String item, String search) {
        table.getColumn(search).shouldHave(sizeGreaterThanOrEqual(1)).findBy(text(item)).shouldNot(exist);
    }
}
