package io.hawt.tests.features.pageobjects.fragments.camel.tabs.endpoints;

import static com.codeborne.selenide.Condition.editable;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Selenide.$;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Add new Endpoint view on Endpoints Tab page in Camel.
 */
public class CamelEndpointsAdd extends CamelPage {

    /**
     * Add a new Endpoint from URI.
     *
     * @param uri of endpoint to be added
     */
    public void fromUri(String uri) {
        clickButton("From URI");
        $("#uri-input-text").shouldBe(editable).sendKeys(uri);
        clickButton("Submit");
    }

    /**
     * Add a new Endpoint from Data.
     *
     * @param endpoint  name of the endpoint
     * @param component of the endpoint
     */
    public void fromData(String endpoint, String component) {
        clickButton("From Data");
        $("#pf-select-toggle-id-0").shouldBe(enabled).click();
        clickButton(component);
        $("#endpoint-path-input").shouldBe(editable).sendKeys(endpoint);
        clickButton("Submit");
    }
}
