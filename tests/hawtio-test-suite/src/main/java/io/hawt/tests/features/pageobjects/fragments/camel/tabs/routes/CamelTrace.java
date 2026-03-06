package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;
import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byClassName;
import static com.codeborne.selenide.Selectors.byId;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.SelenideElement;

/**
 * Represents Trace Tab page in Camel.
 */
public class CamelTrace extends CamelPage {
    private static final SelenideElement ROUTE_MESSAGE_TABLE_SELECTOR = $(byId("route-message-table"));
    private static final SelenideElement ROUTE_DIAGRAM_SELECTOR = $(byId("route-diagram-tracing-view"));

    /**
     * Starts tracing. Will ensure that it starts even if it was running before.
     */
    public void startTracing() {
        if (!traceTableIsShown()) {
            clickButton("Start Tracing");
        }
    }

    /**
     * Stop tracing. Will ensure that it stops even if it wasn't running before.
     */
    public void stopTracing() {
        if (traceTableIsShown()) {
            clickButton("Stop Tracing");
        }
    }

    /**
     * Checks if trace table has some data.
     */
    public void traceTableHasData() {
        ROUTE_MESSAGE_TABLE_SELECTOR.$$(byClassName("pf-v6-c-table__tr")).shouldHave(sizeGreaterThan(0));
    }

    /**
     * Checks if trace diagram has some data.
     */
    public void traceDiagramHasData() {
         ROUTE_DIAGRAM_SELECTOR.$$("[class~='react-flow__node']").shouldHave(sizeGreaterThan(0));
    }

    /**
     * Ensure that the route message table is not shown.
     */
    public void traceTableIsNotShown() {
        ROUTE_MESSAGE_TABLE_SELECTOR.shouldNotBe(visible);
    }

    /**
     * Ensure that the route diagram is not shown.
     */
    public void traceDiagramIsNotShown() {
        ROUTE_DIAGRAM_SELECTOR.shouldNotBe(visible);
    }

    /**
     * Checks if trace table is shown.
     * @return true if table exists
     */
    private boolean traceTableIsShown() {
        return ROUTE_MESSAGE_TABLE_SELECTOR.exists();
    }

    /**
     * Checks if trace diagram is shown.
     * @return true if diagram exists
     */
    private boolean traceDiagramIsShown() {
        return ROUTE_DIAGRAM_SELECTOR.exists();
    }
}
