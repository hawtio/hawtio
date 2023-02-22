package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byClassName;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class CamelDebug extends HawtioPage {
    /**
     * Start debugging.
     */
    public void startDebugging() {
        // check if debug is started
        if ($(byXpath("//button[contains(text(), 'Start debugging')]")).exists()) {
            clickButton("Start debugging");
        }
    }

    /**
     * Stop debugging.
     */
    public void stopDebugging() {
        clickButton("Stop debugging");
    }

    /**
     * Check whether debugging is stopped.
     */
    public void checkDebuggingIsStopped() {
        $(byXpath("//button[contains(text(), 'Start debugging')]")).should(exist);
    }

    /**
     * Add a breakpoint into debug diagram.
     *
     * @param nodeId node's ID
     * @return camel debug page
     */
    public CamelDebug addBreakpoint(String nodeId) {
        selectNodeElement(nodeId);
        clickButton("Add breakpoint");
        return this;
    }

    /**
     * Select node's element.
     *
     * @param nodeId node's ID
     * @return camel debug page
     */
    private CamelDebug selectNodeElement(String nodeId) {
        if (!nodeElement(nodeId).getAttribute("class").contains("selected")) {
            nodeElement(nodeId).shouldBe(visible).click();
        }
        return this;
    }

    /**
     * Get node's element.
     *
     * @param nodeId node's ID
     * @return node's selenide element
     */
    private SelenideElement nodeElement(String nodeId) {
        return $(byXpath("//*[@id='" + nodeId + "']"));
    }

    /**
     * Check whether a breakpoint is present.
     *
     * @param nodeId node's ID
     * @return camel debug page
     */
    public CamelDebug checkBreakpointIsPresent(String nodeId) {
        nodeElement(nodeId).$(byClassName("breakpoint")).shouldBe(visible);
        return this;
    }

    /**
     * Check whether a breakpoint is not present.
     *
     * @param nodeId node's ID
     * @return camel debug page
     */
    public CamelDebug checkBreakpointIsNotPresent(String nodeId) {
        nodeElement(nodeId).$(byClassName("breakpoint")).shouldNotBe(visible);
        return this;
    }

    /**
     * Remove a breakpoint from debug diagram.
     *
     * @param nodeId node's ID
     * @return camel debug started page
     */
    public CamelDebug removeBreakpoint(String nodeId) {
        selectNodeElement(nodeId);
        clickButton("Remove breakpoint");
        // Check the breakpoint icon disappeared from the node element
        nodeElement(nodeId).$(byClassName("breakpoint")).shouldNot(exist);
        return this;
    }
}
