package io.hawt.tests.utils.stepdefinitions.camel.components;

import io.cucumber.java.en.And;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelProperties;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.utils.pageobjects.pages.camel.components.CamelSpecificComponentPage;

public class CamelSpecificComponentStepDefs {
    private final CamelPage camelPage = new CamelPage();
    private CamelAttributes camelAttributes;
    private CamelOperations camelOperations;
    private CamelProperties camelProperties;
    private CamelSpecificComponentPage camelSpecificComponentPage;

    @And("^User is on Camel \"([^\"]*)\" node of Components folder of \"([^\"]*)\" context$")
    public void userIsOnCamelSpecificComponentPageOfSpecificContext(String node, String context) {
        camelSpecificComponentPage = camelPage.camelTree()
            .expandSpecificContext(CamelTree.class, context)
            .expandSpecificFolder(CamelTree.class, "components")
            .selectSpecificNode(CamelSpecificComponentPage.class, node, "components", context);
    }

    @When("^User clicks on Attributes tab of Camel Specific Component page$")
    public void userClicksOnAttributesTabOfCamelSpecificComponentPage() {
        camelAttributes = camelSpecificComponentPage.attributes();
    }

    @When("^User clicks on Properties tab of Camel Specific Component page$")
    public void userClicksInPropertiesTabOfCamelSpecificComponentPage() {
        camelProperties = camelSpecificComponentPage.properties();
    }

    @When("^User clicks on Operations tab of Camel Specific Component page$")
    public void userClicksOnOperationsTabOfCamelSpecificComponentPage() {
        camelOperations = camelSpecificComponentPage.operations();
    }
}
