package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common;

import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class CamelTypeConverters extends HawtioPage {
    /**
     * Enable statistics.
     *
     * @return camel type converters page
     */
    public CamelTypeConverters enableStatistics() {
        clickButton("Enable statistics");
        return this;
    }
}
