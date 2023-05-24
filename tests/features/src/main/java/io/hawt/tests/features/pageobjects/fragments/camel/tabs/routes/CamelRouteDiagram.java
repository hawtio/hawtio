package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.Selenide.$$;

import com.codeborne.selenide.CollectionCondition;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Route Diagram Tab page in Camel.
 */
public class CamelRouteDiagram extends CamelPage {
    /**
     * Check that routes diagram is present on this page.
     */
    public void diagramIsPresent() {
        $$(".camel-node-content").shouldHave(CollectionCondition.sizeGreaterThan(1));
    }
}
