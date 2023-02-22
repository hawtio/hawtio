package io.hawt.tests.utils.pageobjects.pages.camel.routes;

import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes.CamelRouteDiagram;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes.CamelRoutes;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

/**
 * Main page for Camel -> given a Context -> Routes folder.
 */
public class CamelRoutesPage extends CamelPage {

    public CamelRoutes routes() {
        return openTab("Routes", CamelRoutes.class);
    }

    public CamelRouteDiagram routeDiagram() {
        return openTab("Route Diagram", CamelRouteDiagram.class);
    }
}
