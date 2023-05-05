package io.hawt.tests.utils.pageobjects.pages.camel.contexts;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Selectors.byXpath;
import io.hawt.tests.utils.pageobjects.fragments.Table;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

/**
 * Represents Camel Contexts Page.
 */
public class CamelContextsPage extends CamelPage {
    private static final Table table = new Table();

    /**
     * Check the state of context.
     *
     * @param context checked context
     * @param state   checked state
     */
    public void hasState(String context, String state) {
        table.getRowByValue(context).$(byXpath("./td[3]")).shouldHave(exactText(state));
    }

    /**
     * Select a given Camel context.
     *
     * @param context to be selected
     */
    public void selectContext(String context) {
        table.getRowByValue(context).$(byXpath("./td[1]//input")).shouldBe(enabled).click();
    }
}
