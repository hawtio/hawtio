package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.features.utils.ByUtils;
import static com.codeborne.selenide.Condition.clickable;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byAttribute;
import static com.codeborne.selenide.Selectors.byClassName;
import static com.codeborne.selenide.Selectors.byTagAndText;
import static com.codeborne.selenide.Selectors.byTagName;
import static com.codeborne.selenide.Selectors.withTagAndText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

/**
 * Represents Debug Tab page in Camel.
 */
public class CamelDebug extends CamelPage {
    private static final ElementsCollection BUTTONS = $$(".pf-v6-c-button__text");

    /**
     * Add a breakpoint on a specific node.
     *
     * @param node on what the breakpoint is set
     */
    public void addBreakpoint(String node) {
        $(withTagAndText("div", node)).shouldBe(visible).click();
        clickButton("Add breakpoint");
    }

    /**
     * Remove a breakpoint from a specific node.
     *
     * @param node from what the breakpoint is removed
     */
    public void removeBreakpoint(String node) {
        final SelenideElement resumeButton = $(byAttribute("title", "Resume running")).$(byTagName("button"));
        $(withTagAndText("div", node)).shouldBe(visible).click();
        clickButton("Remove breakpoint");
        if (resumeButton.is(enabled)) {
            resumeButton.click();
        }
    }

    /**
     * Check whether a breakpoint is set or not.
     *
     * @param node  on what whether the breakpoint is set or not
     * @param state of breakpoijt whether it is set or not
     */
    public void breakpointSignIsSet(String node, String state) {
        final SelenideElement breakpointSign = $(withTagAndText("div", node)).ancestor("div", 1).$(byClassName("breakpoint-symbol"));
        if (state.contains("true")) {
            breakpointSign.shouldBe(visible);
        } else {
            breakpointSign.shouldNotBe(visible);
        }
    }

    /**
     * Start debugging mode.
     */
    public void startDebugging() {
        clickButton("Start Debugging");
    }

    /**
     * Check that the debugging is started.
     */
    public void debuggingIsStarted() {
        BUTTONS.findBy(exactText("Stop Debugging")).closest("button").shouldBe(clickable);
        $(byTagAndText("p", "Debugging allows you to step through camel routes to diagnose issues.")).shouldNotBe(visible);
    }

    public boolean isDebuggingOn() {
        return !$(ByUtils.byDataTestId("no-debugging")).exists();
    }

    /**
     * Stop debugging mode.
     */
    public void stopDebugging() {
        clickButton("Stop Debugging");
    }

    /**
     * Check whether the start debugging option is present.
     */
    public void startDebuggingOptionIsPresented() {
        BUTTONS.findBy(exactText("Start Debugging")).closest("button").shouldBe(clickable);
        $(byTagAndText("p", "Debugging allows you to step through camel routes to diagnose issues.")).shouldBe(visible);
    }
}
