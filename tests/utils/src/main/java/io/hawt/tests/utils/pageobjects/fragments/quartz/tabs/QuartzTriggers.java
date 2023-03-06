package io.hawt.tests.utils.pageobjects.fragments.quartz.tabs;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import io.hawt.tests.utils.pageobjects.fragments.Table;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class QuartzTriggers extends HawtioPage {
    private static final Table table = new Table();

    /**
     * Check that table of trigger table is not empty.
     *
     * @return quartz triggers page
     */
    public QuartzTriggers checkTableNotEmpty(String headerName) {
        table.getColumn(headerName).shouldBe(sizeGreaterThanOrEqual(1));
        return this;
    }
}
