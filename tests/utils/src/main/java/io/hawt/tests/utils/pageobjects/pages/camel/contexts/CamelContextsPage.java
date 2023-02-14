package io.hawt.tests.utils.pageobjects.pages.camel.contexts;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import io.hawt.tests.utils.pageobjects.fragments.Table;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

public class CamelContextsPage extends CamelPage {
    private static final Table table = new Table();

    /**
     * Select specific context in Camel Contexts of Camel tree.
     *
     * @param context name of a context to select
     * @return Camel Contexts page
     */
    public CamelContextsPage selectContext(String context) {
        if (!isContextSelected(context)) {
            clickCheckBoxButton(context);
        }
        return this;
    }

    /**
     * Check the state of context.
     *
     * @param context checked context
     * @param state   checked state
     * @return camel contexts page
     */
    public boolean hasState(String context, String state) {
        return state.equals(table.getRowByValue(context).$(byXpath("./td[3]/span")).getText());
    }

    /**
     * Check whether a specific context is selected.
     *
     * @param context name of a context to check.
     * @return boolean
     */
    public boolean isContextSelected(String context) {
        return table.getRowByValue(context).$(byXpath("./td[1]/input")).getAttribute("class").contains("not-empty");
    }

    /**
     * Start the context in Camel Contexts of a Camel tree.
     *
     * @return Camel Contexts page
     */
    public CamelContextsPage start() {
        if (anyContextSelected()) {
            clickButton("Start");
        }
        return this;
    }

    /**
     * Suspend the context in Camel Contexts of a Camel tree.
     *
     * @return Camel Contexts page
     */
    public CamelContextsPage suspend() {
        if (anyContextSelected()) {
            clickButton("Suspend");
        }
        return this;
    }

    /**
     * Check whether any context is selected.
     *
     * @return boolean
     */
    private boolean anyContextSelected() {
        return ($(byXpath("//input[contains(@value, 'item.selected') and contains(@class, 'ng-not-empty')]")).exists());
    }

    /**
     * Click on check box.
     *
     * @param context name of a context to select
     */
    private void clickCheckBoxButton(String context) {
        table.getRowByValue(context).$(byXpath("./td[1]/input")).shouldBe(enabled).click();
    }
}
