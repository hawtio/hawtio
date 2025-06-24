package io.hawt.tests.features.stepdefinitions.camel;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.fragments.Tree;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

public class CamelTreeStepDefs {
    private final CamelPage camelPage = new CamelPage();

    private static String folder(String id) {
        return id + "-folder";
    }

    @And("^User is on Camel Contexts$")
    public void userIsOnCamelContexts() {
        camelPage.tree().selectSpecificItemByExactId(folder("org.apache.camel") + "-" + folder("CamelContexts"));
    }

    @And("^User is on Camel \"([^\"]*)\" context$")
    public void userIsOnCamelContext(String context) {
        camelPage.tree().selectSpecificItem(folder("CamelContexts") + "-" + folder(context));
    }

    @And("^User is on Camel \"([^\"]*)\" folder of \"([^\"]*)\" context$")
    public void userIsOnCamelEndpointsPage(String folder, String context) {
        camelPage.tree()
            .expandSpecificFolder(Tree.class, folder(context))
            .selectSpecificItem(folder(context) + "-" + folder(folder));
    }

    @And("^User is on Camel \"([^\"]*)\" item of \"([^\"]*)\" folder of \"([^\"]*)\" context$")
    public void userIsOnCamelItemOfFolderOfContext(String item, String folder, String context) {
        camelPage.tree()
            .expandSpecificFolder(Tree.class, folder(context))
            .expandSpecificFolder(Tree.class, folder(context) + "-" + folder(folder))
            .selectSpecificItem(folder(context) + "-" + folder(folder) + "-" + item);
    }

    @And("^User is on Camel \"([^\"]*)\" item of \"([^\"]*)\" group of \"([^\"]*)\" folder of \"([^\"]*)\" context$")
    public void userIsOnCamelItemOfGroupOfFolderOfContext(String item, String group, String folder, String context) {
        camelPage.tree()
            .expandSpecificFolder(Tree.class, folder(context))
            .expandSpecificFolder(Tree.class, folder(context) + "-" + folder(folder))
            .expandSpecificFolder(Tree.class, folder(context) + "-" + folder(folder) + "-" + folder(group))
            .selectSpecificItem(folder(context) + "-" + folder(folder) + "-" + folder(group) + "-" + item);
    }

    @When("^User expands Camel tree$")
    public void userExpandsCamelTree() {
        camelPage.tree().expandTree();
    }

    @When("^User collapses Camel tree$")
    public void userCollapsesCamelTree() {
        camelPage.tree().collapseTree();
    }

    @Then("^All Camel tree nodes are \"([^\"]*)\"$")
    public void allCamelTreeNodesAre(String state) {
        camelPage.tree().allTreeNodesState(state);
    }

    @When("^User filters Camel tree by value of \"([^\"]*)\"$")
    public void userFiltersCamelTreeByValueOf(String value) {
        camelPage.tree().filterTree(value);
    }

    @Then("^Camel tree is filtered by value of \"([^\"]*)\"$")
    public void camelTreeIsFilteredByValueOf(String value) {
        camelPage.tree().treeIsFiltered(value);
    }
}
