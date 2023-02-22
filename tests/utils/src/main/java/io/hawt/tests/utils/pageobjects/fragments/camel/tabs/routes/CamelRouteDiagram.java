package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Represents Route Diagram Tab page in Camel.
 */
public class CamelRouteDiagram extends HawtioPage {
    /**
     * Check, that routes diagram is present on this page.
     *
     * @return camel routes diagram page
     */
    public CamelRouteDiagram diagramIsPresent() {
        $(byXpath("//*[contains(@class, \"camel-diagram\")]")).should(exist);
        return this;
    }
}
