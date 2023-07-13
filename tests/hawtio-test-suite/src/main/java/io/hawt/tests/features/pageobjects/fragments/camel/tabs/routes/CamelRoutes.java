package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Selenide.$;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Routes Tab page in Camel.
 */
public class CamelRoutes extends CamelPage {
    /**
     * Delete a route.
     */
    public void delete() {
        $("#camel-routes-toolbar-item-dropdown-toggle").shouldBe(enabled).click();
        clickButton("Delete");
    }

    /**
     * Confirm an action.
     *
     * @return Camel Route class
     */
    public CamelRoutes confirm() {
        clickButton("Delete");
        return this;
    }
}
