package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Represents Endpoints Tab page in adding mode in Camel.
 */
public class CamelEndpointsAdd extends HawtioPage {
    /**
     * Add endpoint from URI.
     *
     * @param endpointUri URI of endpoint to be added.
     * @return camel attributes page.
     */
    public CamelEndpointsAdd fromUri(String endpointUri) {
        $(byXpath("//input[@ng-model='endpointName']")).shouldBe(visible).sendKeys(endpointUri);
        // Using clickButton() method is not possible because of the same name of buttons in fromUri and fromData methods
        $(byXpath("//button[@ng-click='createEndpoint(endpointName)']")).shouldBe(enabled).click();
        return page(CamelEndpointsAdd.class);
    }
}
