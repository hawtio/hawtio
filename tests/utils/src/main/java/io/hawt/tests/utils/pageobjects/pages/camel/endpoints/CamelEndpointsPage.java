package io.hawt.tests.utils.pageobjects.pages.camel.endpoints;

import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelChart;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints.CamelEndpoints;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

/**
 * Main page for Camel -> given a Context -> Endpoints folder.
 */
public class CamelEndpointsPage extends CamelPage {
    public CamelAttributes attributes() {
        return openTab("Attributes", CamelAttributes.class);
    }

    public CamelEndpoints endpoints() {
        return openTab("Endpoints", CamelEndpoints.class);
    }

    public CamelChart chart() {
        return openTab("Chart", CamelChart.class);
    }
}
