package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
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

    /**
     * Check that columns has added endpoint.
     *
     * @param endpointUri added endpoint URI to be checked.
     * @return camel attributes page.
     */
    public CamelAttributes checkAddedEndpoint(String endpointUri) {
        refresh(CamelAttributes.class);
        $(byXpath("//*[contains(@title, '" + endpointUri + "')]")).should(exist);
        return this;
    }
}
