package io.hawt.tests.features.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.Condition.visible;
import io.hawt.tests.features.pageobjects.fragments.Table;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Attributes Tab page in Camel.
 */
public class CamelAttributes extends CamelPage {
    private static final Table table = new Table();

    /**
     * Open detail dialog of specified attribute by attribute name.
     *
     * @param attributeName of detail dialog to be open
     */
    public void openAttributeDetailDialogByAttributeName(String attributeName) {
        table.getRowByValue(attributeName).shouldBe(visible).click();
    }
}
