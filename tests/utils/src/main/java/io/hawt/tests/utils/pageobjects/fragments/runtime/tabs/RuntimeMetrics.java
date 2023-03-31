package io.hawt.tests.utils.pageobjects.fragments.runtime.tabs;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Represents Runtime -> Metrics tab page.
 */
public class RuntimeMetrics extends HawtioPage {
    public RuntimeMetrics checkMetricIsPresented(String metricName) {
        $(byXpath(".//div[contains(@class, 'row row-cards-pf')]//h2[contains(text(), '" + metricName + "')]")).shouldBe(visible);
        return this;
    }

    public RuntimeMetrics checkMetricHasData(String metricName) {
        $(byXpath(".//pf-card[@head-title='" + metricName + "']//div[contains(@class, 'card-pf-info-item')]")).exists();
        return this;
    }
}
