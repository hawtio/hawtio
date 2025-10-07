package io.hawt.tests.features.pageobjects.pages;

import static com.codeborne.selenide.Condition.cssClass;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import org.openqa.selenium.By;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.features.pageobjects.fragments.Panel;
import io.hawt.tests.features.pageobjects.fragments.menu.Menu;

/**
 * Represents Hawtio page with common methods.
 */
public class HawtioPage {

    private static final By HEADER_SELECTOR = By.id("hawtio-header-brand");

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
     * Click on button with a given aria-label.
     *
     * @param ariaLabel on the given button
     */
    public HawtioPage clickButtonByAriaLabel(String ariaLabel) {
        $(byXpath("//button[@aria-label='" + ariaLabel + "']")).shouldBe(enabled).click();
        return this;
    }

    /**
     * Check an alert message of a successful action.
     *
     * @return this
     */
    public HawtioPage successfulAlertMessage() {
        $(byXpath("//div[contains(@class, 'pf-v5-c-alert pf-m-success')]")).shouldBe(interactable);
        return this;
    }

    /**
     * Check an alert message of an unsuccessful action.
     *
     * @return this
     */
    public HawtioPage unsuccessfulAlertMessage() {
        $(byXpath("//div[contains(@class, 'pf-v5-c-alert pf-m-danger')]")).shouldBe(interactable);
        return this;
    }

    /**
     * Close an alert message.
     */
    public void closeAlertMessage() {
        $(byXpath("//div[contains(@class, 'pf-v5-c-alert')]//button[contains(@aria-label, 'Close')]")).shouldBe(enabled).click();
    }

    /**
     * Open a given tab.
     *
     * @param tab to be opened.
     */
    public void openTab(String tab) {
        final SelenideElement tabElement = $(byXpath("//a[text()='" + tab + "']"));
        if (!tabElement.has(cssClass("active"))) {
            tabElement.scrollTo();
            tabElement.shouldBe(enabled).click();
            tabElement.shouldHave(cssClass("active"));
        }
    }

    public SelenideElement getLogo() {
        return $(HEADER_SELECTOR).$(By.className("pf-v5-c-brand"));
    }

    public String getAppName() {
        return $(HEADER_SELECTOR).$(By.tagName("h1")).text();
    }
}
