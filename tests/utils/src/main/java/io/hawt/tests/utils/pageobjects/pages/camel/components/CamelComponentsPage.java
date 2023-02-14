package io.hawt.tests.utils.pageobjects.pages.camel.components;

import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

/**
 * Main page for Camel -> given a Context -> Components.
 */
public class CamelComponentsPage extends CamelPage {
    public CamelAttributes attributes() {
        return openTab("Attributes", CamelAttributes.class);
    }
}
