package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Selenide.$$;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Source Tab page in Camel.
 */
public class CamelSource extends CamelPage {
    public void routeSourceCodeIsPresented() {
        $$("div.view-line").shouldHave(sizeGreaterThanOrEqual(1));
    }
}
