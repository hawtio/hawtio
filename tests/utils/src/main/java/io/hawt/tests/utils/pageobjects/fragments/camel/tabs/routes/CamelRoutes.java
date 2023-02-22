package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.CollectionCondition.empty;
import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Condition.cssClass;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.fragments.Table;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Represents Routes Tab page in Camel.
 */
public class CamelRoutes extends HawtioPage {
    private static final Table table = new Table();

    /**
     * Click checkbox next to the route.
     *
     * @param route route for selection
     * @return camel routes page
     */
    public CamelRoutes selectRoute(String route) {
        table.getRowByValue(route).$(byXpath("./td[1]/input")).shouldBe(enabled).click();
        return this;
    }

    /**
     * Get the state of the route.
     *
     * @param route name of the route
     * @return route selenide element
     */
    public SelenideElement getRouteState(String route) {
        return table.getRowByValue(route).$(byXpath("./td[3]/span"));
    }

    /**
     * Check that delete button is disabled.
     */
    public void checkDeleteButtonIsDisabled() {
        $(byXpath("//ul[@uib-dropdown-menu]/li")).shouldHave(cssClass("disabled"));
    }

    /**
     * Check route state.
     *
     * @param route name of the route
     * @param state expected route state
     */
    public void checkRouteState(String route, String state) {
        getRouteState(route).shouldHave(exactText(state));
    }

    /**
     * Change the state of a given route.
     */
    public CamelRoutes changeState(String operation) {
        clickButton(operation);
        return this;
    }

    /**
     * Delete a route.
     *
     * @return Camel Routes class
     */
    public CamelRoutes delete() {
        $(byXpath("//button[@uib-dropdown-toggle]")).shouldBe(visible).click();
        $(byXpath("//ul[@uib-dropdown-menu]/li/a")).shouldBe(enabled).click();
        return this;
    }

    /**
     * Confirm an action.
     *
     * @return Camel Route class
     */
    public CamelRoutes confirm() {
        $(byXpath("//button[contains(text(),'Delete')]")).shouldBe(enabled).click();
        return this;
    }

    /**
     * Check, that deleted route is not in the table anymore.
     *
     * @param route deleted route
     * @return camel routes page
     */
    public CamelRoutes checkRouteIsNotInTable(String route) {
        getRouteNames().filterBy(text(route)).shouldBe(empty);
        return this;
    }

    /**
     * Check that table with routes is not empty.
     *
     * @return camel routes page
     */
    public CamelRoutes checkRoutesTableIsNotEmpty() {
        getRouteNames().shouldHave(sizeGreaterThan(0));
        return this;
    }

    /**
     * Get route names from the table.
     *
     * @return route names
     */
    public ElementsCollection getRouteNames() {
        return table.getColumn("Name").shouldHave(sizeGreaterThanOrEqual(1));
    }
}
