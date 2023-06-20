package io.hawt.tests.features.pageobjects.fragments.camel.tabs.endpoints;

import static com.codeborne.selenide.Selenide.page;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Endpoints Tab page in Camel.
 */
public class CamelEndpoints extends CamelPage {
    /**
     * Click on Add button to add a new endpoint.
     *
     * @return camel endpoints add page.
     */
    public CamelEndpointsAdd add() {
        clickButton("Add");
        return page(CamelEndpointsAdd.class);
    }
}
