package io.hawt.tests.features.pageobjects.fragments.camel.dialog;

import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selectors.byValue;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Camel Attribute Detail Dialog in Camel.
 */
public class CamelAttributeDetailDialog extends CamelPage {
    private final SelenideElement dialog = $(byXpath("//div[@role='dialog']"));

    /**
     * Check that Detail dialog has key and value.
     *
     * @param key   to be checked
     * @param value to be checked
     * @return this
     */
    public CamelAttributeDetailDialog checkValue(String key, String value) {
        dialog.find(byText(key)).should(exist).shouldBe(interactable);
        dialog.find(byValue(value)).should(exist).shouldBe(interactable);
        return this;
    }

    /**
     * Close the Detail dialog.
     */
    public void closeAttributeDetailDialog() {
        clickButton("Close");
    }
}
