package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byClassName;
import static com.codeborne.selenide.Selectors.byTagAndText;
import static com.codeborne.selenide.Selectors.withTagAndText;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Debug Tab page in Camel.
 */
public class CamelDebug extends CamelPage {
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
        final SelenideElement resumeBtn = $(byTagAndText("button", "Resume"));
        $(withTagAndText("div", node)).shouldBe(visible).click();
        clickButton("Remove breakpoint");
        if (resumeBtn.is(enabled)) {
            resumeBtn.click();
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
        $(byTagAndText("button", "Stop Debugging")).shouldBe(visible).shouldBe(enabled);
        $(byTagAndText("p", "Debugging allows you to step through camel routes to diagnose issues.")).shouldNotBe(visible);
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
        $(byTagAndText("button", "Start Debugging")).shouldBe(visible).shouldBe(enabled);
        $(byTagAndText("p", "Debugging allows you to step through camel routes to diagnose issues.")).shouldBe(visible);
    }
}
