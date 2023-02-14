package io.hawt.tests.utils.pageobjects.fragments.camel.dialog;

import static com.codeborne.selenide.Condition.value;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;

public class CamelAttributeDetailDialog {
    private final SelenideElement dialog = $(".modal-content");

    /**
     * Close the detail dialog.
     *
     * @return camel attributes page
     */
    public CamelAttributes closeTheDetailDialog() {
        dialog.find(byXpath(".//span[@class='pficon pficon-close']")).shouldBe(visible).click();
        return page(CamelAttributes.class);
    }

    /**
     * Get key from detail dialog.
     *
     * @return key value
     */
    public String getKey() {
        return dialog.find(byXpath(".//input[@name='key']")).getValue();
    }

    /**
     * Get value from detail dialog.
     *
     * @return value string
     */
    public SelenideElement getValue() {
        return dialog.find(byXpath(".//textarea[@name='attrValueView']")).shouldBe(visible);
    }

    /**
     * Check, that value is according to expectations.
     *
     * @param tableValue value from attributes table
     * @return camel attribute detail dialog
     */
    public CamelAttributeDetailDialog checkValue(String tableValue) {
        getValue().shouldHave(value(tableValue)).getText();
        return this;
    }
}
