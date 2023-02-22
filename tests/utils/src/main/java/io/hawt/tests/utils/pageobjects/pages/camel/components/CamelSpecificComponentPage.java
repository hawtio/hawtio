package io.hawt.tests.utils.pageobjects.pages.camel.components;

import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelProperties;

/**
 * Main page for Camel -> specific Context -> Components folder -> specific Component.
 */
public class CamelSpecificComponentPage extends CamelComponentsPage {
    public CamelAttributes attributes() {
        return openTab("Attributes", CamelAttributes.class);
    }

    public CamelProperties properties() {
        return openTab("Properties", CamelProperties.class);
    }

    public CamelOperations operations() {
        return openTab("Operations", CamelOperations.class);
    }
}
