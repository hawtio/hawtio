package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.CollectionCondition.size;
import static com.codeborne.selenide.Selectors.byId;
import static com.codeborne.selenide.Selectors.withTagAndText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;
import java.util.Iterator;

/**
 * Represents Trace Tab page in Camel.
 */
public class CamelTrace extends CamelPage {
    /**
     * Starts tracing. Will ensure that it starts even if it was running before.
     */
    public void startTracing() {
        final Iterable<SelenideElement> stopTracingButtons = $$(withTagAndText("button","Stop Tracing"));
        final Iterator<SelenideElement> buttonsIterator = stopTracingButtons.iterator();

        if(buttonsIterator.hasNext()) {
            buttonsIterator.next().click();        
        }

        final SelenideElement startTracingButton = $(withTagAndText("button","Start Tracing"));

        startTracingButton.click();
    }

    /**
     * Stop tracing. Will ensure that it stops even if it wasn't running before.
     */
    public void stopTracing() {
        final Iterable<SelenideElement> startTracingButtons = $$(withTagAndText("button","Start Tracing"));
        final Iterator<SelenideElement> buttonsIterator = startTracingButtons.iterator();

        if(buttonsIterator.hasNext()) {
            buttonsIterator.next().click();        
        }

        final SelenideElement stopTracingButton = $(withTagAndText("button","Stop Tracing"));

        stopTracingButton.click();
    }

    /**
     * Checks if trace table is shown
     */
    public void traceTableIsShown() {
        $$(byId("route-message-table")).shouldHave(sizeGreaterThan(0));
    }

    /**
     * Checks if trace diagram is shown
     */
    public void traceDiagramIsShown() {
        $$(byId("route-diagram-tracing-view")).shouldHave(sizeGreaterThan(0));
    }

    /**
     * Checks if trace table is not shown
     */
    public void traceTableIsntShown() {
        $$(byId("route-message-table")).shouldHave(size(0));
    }

    /**
     * Checks if trace diagram is not shown
     */
    public void traceDiagramIsntShown() {
        $$(byId("route-diagram-tracing-view")).shouldHave(size(0));
    }
}
