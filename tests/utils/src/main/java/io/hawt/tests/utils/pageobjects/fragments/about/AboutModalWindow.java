package io.hawt.tests.utils.pageobjects.fragments.about;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;

import com.codeborne.selenide.SelenideElement;

public class AboutModalWindow {
    private final SelenideElement aboutModalWindow = $(".pf-c-about-modal-box");

    /**
     * Click on Close button.
     *
     * @return the previously opened page
     */
    public <P> P close(Class<P> pageObjectClass) {
        aboutModalWindow.$(byXpath(".//button[contains(@aria-label, 'Close Dialog')]")).shouldBe(visible).click();
        return page(pageObjectClass);
    }

    /**
     * Check whether a modal window is open.
     *
     * @return this
     */
    public AboutModalWindow isAboutModalWindowOpen() {
        aboutModalWindow.shouldBe(visible);
        return this;
    }
}
