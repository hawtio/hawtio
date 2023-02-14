package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.page;
import io.hawt.tests.utils.pageobjects.fragments.Table;
import io.hawt.tests.utils.pageobjects.fragments.camel.dialog.CamelAttributeDetailDialog;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Camel Attributes tab
 */
public class CamelAttributes extends HawtioPage {
    private static final Table table = new Table();

    /**
     * Open detail dialog of specified attribute by attribute name.
     *
     * @param attributeName of detail dialog to be open
     * @return camel attribute detail dialog
     */
    public CamelAttributeDetailDialog openAttributeDetailDialogByAttributeName(String attributeName) {
        table.getRowInAttributesTable(attributeName).shouldBe(visible).click();
        return page(CamelAttributeDetailDialog.class);
    }
}
