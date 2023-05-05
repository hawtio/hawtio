package io.hawt.tests.utils.stepdefinitions.camel;

import io.cucumber.java.en.And;
import io.hawt.tests.utils.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

public class CamelTreeStepDefs {
    private final CamelPage camelPage = new CamelPage();

    @And("^User is on Camel Contexts$")
    public void userIsOnCamelContexts() {
        camelPage.camelTree().selectSpecificItemByExactId("org.apache.camel-CamelContexts");
    }

    @And("^User is on Camel \"([^\"]*)\" context$")
    public void userIsOnCamelContext(String context) {
        camelPage.camelTree().selectSpecificItem("CamelContexts-" + context);
    }

    @And("^User is on Camel \"([^\"]*)\" folder of \"([^\"]*)\" context$")
    public void userIsOnCamelEndpointsPage(String folder, String context) {
        camelPage.camelTree()
            .expandSpecificFolder(CamelTree.class, context)
            .selectSpecificItem(context + "-" + folder);
    }

    @And("^User is on Camel \"([^\"]*)\" item of \"([^\"]*)\" folder of \"([^\"]*)\" context$")
    public void userIsOnCamelItemOfFolderOfContext(String item, String folder, String context) {
        camelPage.camelTree()
            .expandSpecificFolder(CamelTree.class, context)
            .expandSpecificFolder(CamelTree.class, context + "-" + folder)
            .selectSpecificItem(context + "-" + folder + "-" + item);
    }
}
