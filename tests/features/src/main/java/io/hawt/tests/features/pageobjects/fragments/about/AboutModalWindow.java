package io.hawt.tests.features.pageobjects.fragments.about;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Selectors.byAttribute;
import static com.codeborne.selenide.Selenide.$;

/**
 * Represents About modal window on Hawtio page.
 */
public class AboutModalWindow {
    /**
     * Click on Close button.
     */
    public void close() {
        $(byAttribute("aria-label", "Close Dialog")).shouldBe(enabled).click();
    }
}
