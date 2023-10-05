package io.hawt.tests.features.pageobjects.pages.camel;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Selectors.byXpath;
import io.hawt.tests.features.pageobjects.fragments.Table;
import io.hawt.tests.features.pageobjects.fragments.Tree;
import io.hawt.tests.features.pageobjects.pages.HawtioPage;

/**
 * Represents Camel page.
 */
public class CamelPage extends HawtioPage {
    private final Tree tree;
    private final Table table;

    public CamelPage() {
        tree = new Tree();
        table = new Table();
    }

    public Tree tree() {
        return tree;
    }

    /**
     * Check the state of context.
     *
     * @param item  checked context
     * @param state checked state
     */
    public void hasState(String item, String state) {
        table.getRowByValue(item).$(byXpath("./td[3]")).shouldHave(exactText(state));
    }

    /**
     * Select a given Camel context.
     *
     * @param item to be selected
     */
    public void selectContext(String item) {
        table.getRowByValue(item).$(byXpath("./td[1]//input")).shouldBe(enabled).click();
    }
}
