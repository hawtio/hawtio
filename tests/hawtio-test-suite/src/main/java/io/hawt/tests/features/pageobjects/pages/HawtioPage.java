package io.hawt.tests.features.pageobjects.pages;

import static com.codeborne.selenide.Condition.cssClass;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.hidden;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byAttribute;
import static com.codeborne.selenide.Selectors.byTagAndText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.features.pageobjects.fragments.Panel;
import io.hawt.tests.features.pageobjects.fragments.menu.Menu;

/**
 * Represents Hawtio page with common methods.
 */
public class HawtioPage {
    private final Menu menu;
    private final Panel panel;

    public HawtioPage() {
        menu = new Menu();
        panel = new Panel();
    }

    public Menu menu() {
        return menu;
    }

    public Panel panel() {
        return panel;
    }

    /**
     * Click on button with a given text.
     *
     * @param text on the given button
     */
    public HawtioPage clickButton(String text) {
        $(byXpath("//button[text()[normalize-space() = '" + text + "']]")).shouldBe(enabled).click();
        return this;
    }

    /**
     * Check an alert message of a successful action.
     *
     * @return this
     */
    public HawtioPage successfulAlertMessage() {
        $(byXpath("//div[contains(@class, 'pf-c-alert pf-m-success')]")).shouldBe(interactable);
        return this;
    }

    /**
     * Check an alert message of an unsuccessful action.
     *
     * @return this
     */
    public HawtioPage unsuccessfulAlertMessage() {
        $(byXpath("//div[contains(@class, 'pf-c-alert pf-m-danger')]")).shouldBe(interactable);
        return this;
    }

    /**
     * Close an alert message.
     */
    public void closeAlertMessage() {
        $(byXpath("//div[contains(@class, 'pf-c-alert')]//button[contains(@aria-label, 'Close')]")).shouldBe(enabled).click();
    }

    /**
     * Open a given tab.
     *
     * @param tab to be opened.
     */
    public void openTab(String tab) {
        final SelenideElement tabElement = $(byXpath("//a[text()='" + tab + "']"));
        final SelenideElement scrollRightButton = $(byAttribute("aria-label", "Scroll right"));
        final String currentCamelTreeNode = $(byXpath("//h1[contains(@class, 'title')]")).shouldBe(visible).getText();

        // if the tab is not active, navigate to the tab
        if (!tabElement.has(cssClass("active"))) {

            // if the tab is not displayed, refresh the page (workaround for a slow network connection)
            // after the refresh, camel page is reset and camel tree is collapsed, so it is needed to get back
            if (!tabElement.isDisplayed()) {
                Selenide.refresh();
                $(byAttribute("aria-label", "Expand Collapse")).shouldBe(enabled).click();
                $(byTagAndText("button", currentCamelTreeNode)).shouldBe(visible).click();
            }

            // if the tab is hidden, scroll to the right
            while (!tabElement.is(visible)) {
                scrollRightButton.shouldBe(enabled).click();
            }

            tabElement.should(exist).shouldNotBe(hidden).click();
        }
    }
}
