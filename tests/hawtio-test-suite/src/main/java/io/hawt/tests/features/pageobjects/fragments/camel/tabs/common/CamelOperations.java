package io.hawt.tests.features.pageobjects.fragments.camel.tabs.common;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;
import static com.codeborne.selenide.Condition.clickable;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byAttribute;
import static com.codeborne.selenide.Selectors.byTagAndText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.TextMatchOptions.partialText;

import org.openqa.selenium.By;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebElementCondition;

/**
 * Represents Operations Tab page in Camel.
 */
public class CamelOperations extends CamelPage {

    private static final By EXPAND_BUTTON_SELECTOR = byAttribute( "aria-label", "Details");
    private static final By EXECUTE_BUTTON_SELECTOR = byTagAndText("span", "Execute");
    private static final By RESULT_PRE_SELECTOR = By.tagName("pre");
    private static final By DISABLED_ICON_SELECTOR = By.cssSelector(".pf-v6-c-data-list__item-content svg");

    /**
     * Open some method window and execute it.
     *
     * @param method method name
     */
    public void executeMethod(String method) {
        final SelenideElement row = getOperationRow(method);

        ensureRowExpanded(row);

        row.$(EXECUTE_BUTTON_SELECTOR).shouldBe(clickable).click();
    }

    /**
     * Check the result of executed operation.
     *
     * @param method name of executed operation
     * @param result expected result of an operation
     */
    public void checkResultOfExecutedOperation(String method, String result) {
        getOperationRow(method).$(RESULT_PRE_SELECTOR).shouldHave(exactText(result));
    }

    /**
     * Get result of the executed operation as String.
     *
     * @param method name of the operation
     * @return result of the operation as String
     */
    public String getResultOfExecutedOperation(String method) {
        return getOperationRow(method).$(RESULT_PRE_SELECTOR).getText();
    }

    public void checkOperation(String method, WebElementCondition condition) {
        SelenideElement row = getOperationRow(method);
        if (condition == Condition.disabled) {
            row.$(DISABLED_ICON_SELECTOR).should(exist);
        }
        ensureRowExpanded(row);

        row.$(EXECUTE_BUTTON_SELECTOR).shouldBe(condition);    }

    private SelenideElement getOperationRow(String method) {
        return $(byAttribute("aria-labelledby", "operation " + method, partialText())).closest("li");
    }

    private void ensureRowExpanded(SelenideElement row) {
        SelenideElement toggleBtn = row.$(EXPAND_BUTTON_SELECTOR);
        toggleBtn.shouldBe(visible);

        if ("false".equals(toggleBtn.getAttribute("aria-expanded"))) {
            toggleBtn.click();
        }
    }
}
