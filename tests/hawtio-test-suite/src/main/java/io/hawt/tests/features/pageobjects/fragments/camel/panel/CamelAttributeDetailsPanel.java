package io.hawt.tests.features.pageobjects.fragments.camel.panel;

import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selectors.byValue;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Camel Attribute details panel in Camel.
 */
public class CamelAttributeDetailsPanel extends CamelPage {
    private final SelenideElement attributeForm = $(byXpath("//form[@id='attribute-form']"));

    /**
     * Check that Attribute form has key and value.
     *
     * @param key   to be checked
     * @param value to be checked
     * @return this
     */
    public CamelAttributeDetailsPanel checkValue(String key, String value) {
        attributeForm.find(byText(key)).should(exist).shouldBe(interactable);
        attributeForm.find(byValue(value)).should(exist).shouldBe(interactable);
        return this;
    }

    /**
     * Close the Details panel.
     */
    public void closeAttributeDetailsPanel() {
        clickButtonByAriaLabel("Close drawer panel");
    }
}
