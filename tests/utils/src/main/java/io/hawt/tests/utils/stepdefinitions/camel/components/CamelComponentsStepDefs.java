package io.hawt.tests.utils.stepdefinitions.camel.components;

import io.cucumber.java.en.And;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.utils.pageobjects.pages.camel.components.CamelComponentsPage;

public class CamelComponentsStepDefs {
    private final CamelPage camelPage = new CamelPage();
    private CamelAttributes camelAttributes;
    private CamelComponentsPage camelComponentsPage;

    @And("^User is on Camel Components folder of \"([^\"]*)\" context$")
    public void userIsOnCamelComponentsPage(String context) {
        camelComponentsPage = camelPage.camelTree()
            .expandSpecificContext(CamelTree.class, context)
            .expandSpecificFolder(CamelComponentsPage.class, "components");
    }

    @When("^User clicks on Attributes tab of Camel Components page$")
    public void userClicksOnAttributesTabOfCamelEndpointsPage() {
        camelAttributes = camelComponentsPage.attributes();
    }
}
