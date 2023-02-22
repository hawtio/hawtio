package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Represents Chart Tab page in editing mode in Camel.
 */
public class CamelChartEdit extends HawtioPage {
    /**
     * Mark the attribute, which you want for view mode.
     *
     * @param element   of the chart
     * @param attribute of the chart
     * @return camel chart edit page
     */
    public CamelChartEdit selectChart(String element, String attribute) {
        if ($(byXpath("//option[@label='" + element + "']")).exists()) {
            $(byXpath("//option[@label='" + element + "']")).click();
        }
        $(byXpath("//option[@label='" + attribute + "']")).shouldBe(visible).doubleClick();
        return this;
    }

    /**
     * Click on view chart button.
     *
     * @return camel chart view page
     */
    public CamelChart viewChart() {
        clickButton("View Chart");
        return page(CamelChart.class);
    }
}
