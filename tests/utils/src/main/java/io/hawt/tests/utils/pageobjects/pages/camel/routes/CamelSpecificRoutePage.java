package io.hawt.tests.utils.pageobjects.pages.camel.routes;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelChart;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelProperties;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes.CamelDebug;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes.CamelRouteDiagram;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

/**
 * Main page for Camel -> specific Context -> Routes folder -> specific Route.
 */
public class CamelSpecificRoutePage extends CamelPage {
    public CamelAttributes attributes() {
        return openTab("Attributes", CamelAttributes.class);
    }

    public CamelChart chart() {
        return openTab("Chart", CamelChart.class);
    }

    public CamelDebug debug() {
        return openTab("Debug", CamelDebug.class);
    }

    public CamelOperations operations() {
        return openTab("Operations", CamelOperations.class);
    }

    public CamelProperties properties() {
        return openTab("Properties", CamelProperties.class);
    }

    public CamelRouteDiagram routeDiagram() {
        return openTab("Route Diagram", CamelRouteDiagram.class);
    }

    /**
     * Set Stop in dropdown menu in upper right corner of route page.
     *
     * @return camel specific route page.
     */
    public CamelSpecificRoutePage setStop() {
        getCamelActionsDropdown().shouldBe(enabled).click();
        $(byLinkText("Stop")).shouldBe(visible).click();
        return this;
    }

    private SelenideElement getCamelActionsDropdown() {
        return $(byXpath("//div[@class = 'dropdown camel-main-actions']")).shouldBe(enabled);
    }

    /**
     * Check that state of the route contains correct text.
     *
     * @param state state in which should be route
     * @return camel specific route page
     */
    public CamelSpecificRoutePage checkState(String state) {
        getCamelActionsDropdown().shouldHave(text(state));
        return this;
    }
}
