package io.hawt.tests.utils.pageobjects.pages.camel.endpoints;

import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints.CamelBrowse;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints.CamelSend;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

/**
 * Main page for Camel -> specific Context -> Endpoints folder -> specific Endpoint.
 */
public class CamelSpecificEndpointPage extends CamelPage {
    public CamelAttributes attributes() {
        return openTab("Attributes", CamelAttributes.class);
    }

    public CamelOperations operations() {
        return openTab("Operations", CamelOperations.class);
    }

    public CamelSend send() {
        return openTab("Send", CamelSend.class);
    }

    public CamelBrowse browse() {
        return openTab("Browse", CamelBrowse.class);
    }
}
