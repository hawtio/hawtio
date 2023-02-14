package io.hawt.tests.utils.stepdefinitions.camel.tree;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

public class CamelTreeStepDefs {
    private final CamelPage camelPage = new CamelPage();
    private CamelTree camelTree;

    @And("^User is on Camel tree$")
    public void userIsOnCamelTree() {
        camelTree = camelPage.camelTree();
    }

    @When("^User expands Camel tree$")
    public void userExpandsCamelTree() {
        camelTree.expandAll();
    }

    @When("^User collapses Camel tree$")
    public void userCollapsesCamelTree() {
        camelTree.collapseAll();
    }

    @When("^User filters Camel tree by value of \"([^\"]*)\"$")
    public void userFiltersCamelTreeByValue(String value) {
        camelTree.setFilterValue(value);
    }

    @Then("^All nodes of Camel tree are visible")
    public void allNodesOfCamelTreeAreShown() {
        camelTree.allNodesAreVisible();
    }

    @Then("^All nodes of Camel tree are hidden")
    public void allNodesOfCamelTreeAreHidden() {
        camelTree.allNodesAreHidden();
    }

    @Then("^Deployed \"([^\"]*)\" context is presented in Camel tree$")
    public void deployedContextIsPresentedInCamelTree(String context) {
        camelTree.contextIsInCamelTree(context);
    }

    @Then("^Camel tree is filtered by value of \"([^\"]*)\"$")
    public void camelTreeIsFilteredByValue(String value) {
        camelTree.checkTreeFiltering(value)
            .checkCountOfFilterResult(value);
    }
}
