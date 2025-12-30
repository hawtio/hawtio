package io.hawt.tests.features.pageobjects.fragments.about;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Selectors.byAttribute;
import static com.codeborne.selenide.Selenide.$;

import org.openqa.selenium.By;

import com.codeborne.selenide.SelenideElement;

import java.util.HashMap;
import java.util.Map;

/**
 * Represents About modal window on Hawtio page.
 */
public class AboutModalWindow {


    public static final By MODAL_DIALOG = By.className("pf-v6-c-about-modal-box");

    /**
     * Click on Close button.
     */
    public void close() {
        $(byAttribute("aria-label", "Close Dialog")).shouldBe(enabled).click();
    }

    public String getHeaderText() {
        return $(MODAL_DIALOG).$(By.className("pf-v6-c-title")).text();
    }

    public Map<String, String> getAppComponents() {
        Map<String, String> ret = new HashMap<>();
        for (SelenideElement dt : $(By.id("hawtio-about-product-info")).$$(By.tagName("dt"))) {
            ret.put(dt.getText(), dt.sibling(0).text());
        }
        return ret;
    }

    public String getCopyright() {
        return $(MODAL_DIALOG).$(By.className("pf-v6-c-about-modal-box__strapline")).getText();
    }

    public SelenideElement getBrandImage() {
        return $(MODAL_DIALOG).$(By.className("pf-v6-c-about-modal-box__brand-image"));
    }

}
