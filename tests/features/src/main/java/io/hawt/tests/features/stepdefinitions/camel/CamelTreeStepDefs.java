package io.hawt.tests.features.stepdefinitions.camel;

import io.cucumber.java.en.And;
import io.hawt.tests.features.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

public class CamelTreeStepDefs {
    private final CamelPage camelPage = new CamelPage();

    @And("^User is on Camel Contexts$")
    public void userIsOnCamelContexts() {
        camelPage.camelTree().selectSpecificItemByExactId(folder("org.apache.camel") + "-" + folder("CamelContexts"));
    }

    @And("^User is on Camel \"([^\"]*)\" context$")
    public void userIsOnCamelContext(String context) {
        camelPage.camelTree().selectSpecificItem(folder("CamelContexts") + "-" + folder(context));
    }

    @And("^User is on Camel \"([^\"]*)\" folder of \"([^\"]*)\" context$")
    public void userIsOnCamelEndpointsPage(String folder, String context) {
        camelPage.camelTree()
            .expandSpecificFolder(CamelTree.class, folder(context))
            .selectSpecificItem(folder(context) + "-" + folder(folder));
    }

    @And("^User is on Camel \"([^\"]*)\" item of \"([^\"]*)\" folder of \"([^\"]*)\" context$")
    public void userIsOnCamelItemOfFolderOfContext(String item, String folder, String context) {
        camelPage.camelTree()
            .expandSpecificFolder(CamelTree.class, folder(context))
            .expandSpecificFolder(CamelTree.class, folder(context) + "-" + folder(folder))
            .selectSpecificItem(folder(context) + "-" + folder(folder) + "-" + item);
    }

    private static String folder(String id) {
        return id + "-folder";
    }
}
