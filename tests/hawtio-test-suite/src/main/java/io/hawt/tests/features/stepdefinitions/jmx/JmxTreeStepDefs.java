package io.hawt.tests.features.stepdefinitions.jmx;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.pages.jmx.JmxPage;

public class JmxTreeStepDefs {
    private final JmxPage jmxPage = new JmxPage();

    @When("^User expands JMX tree$")
    public void userExpandsJmxTree() {
        jmxPage.tree().expandTree();
    }

    @When("^User collapses JMX tree$")
    public void userCollapsesJmxTree() {
        jmxPage.tree().collapseTree();
    }

    @Then("^All JMX tree nodes are \"([^\"]*)\"$")
    public void allJmxTreeNodesAre(String state) {
        jmxPage.tree().allTreeNodesState(state);
    }

    @When("^User filters JMX tree by value of \"([^\"]*)\"$")
    public void userFiltersJmxTreeByValueOf(String value) {
        jmxPage.tree().filterTree(value);
    }

    @Then("^JMX tree is filtered by value of \"([^\"]*)\"$")
    public void jmxTreeIsFilteredByValueOf(String value) {
        jmxPage.tree().treeIsFiltered(value);
    }
}
