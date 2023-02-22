package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Selenide.page;
import io.hawt.tests.utils.pageobjects.fragments.Table;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Represents Endpoints Tab page in Camel.
 */
public class CamelEndpoints extends HawtioPage {
    private static final Table table = new Table();

    /**
     * Check, that table of endpoints is not empty.
     *
     * @return camel endpoints page.
     */
    public CamelEndpoints checkTableNotEmpty(String headerName) {
        table.getColumn(headerName).shouldBe(sizeGreaterThanOrEqual(1));
        return this;
    }

    /**
     * Click on Add button to add a new endpoint.
     *
     * @return camel endpoints add page.
     */
    public CamelEndpointsAdd add() {
        clickButton("Add");
        return page(CamelEndpointsAdd.class);
    }
}
