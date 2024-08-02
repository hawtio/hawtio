package io.hawt.tests.features.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import org.openqa.selenium.By;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebElementCondition;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.features.utils.ByUtils;

/**
 * Represents Operations Tab page in Camel.
 */
public class CamelOperations extends CamelPage {

    private static final By EXPAND_BUTTON = ByUtils.byAttribute("button", "aria-label", "Details");
    private static final By EXECUTE_BUTTON = ByUtils.byText("button", "Execute");
    /**
     * Open some method window and execute it.
     *
     * @param method method name
     */
    public void executeMethod(String method) {
        final SelenideElement operation = $(operation(method));

        // Expand the operation section
        operation.$(EXPAND_BUTTON).shouldBe(enabled).click();

        // Click on Execute of the given expanded operation section
        operation.$(EXECUTE_BUTTON).shouldBe(enabled).click();
    }

    /**
     * Check the result of executed operation.
     *
     * @param method name of executed operation
     * @param result expected result of an operation
     */
    public void checkResultOfExecutedOperation(String method, String result) {
        final SelenideElement operation = $(operation(method));
        operation.$(byXpath(".//pre")).shouldHave(exactText(result));
    }

    /**
     * Get result of the executed operation as String.
     *
     * @param method name of the operation
     * @return result of the operation as String
     */
    public String getResultOfExecutedOperation(String method) {
        final SelenideElement operation = $(operation(method));
        return operation.$(byXpath(".//pre")).getText();
    }

    public void checkOperation(String method, WebElementCondition condition) {
        final SelenideElement operation = $(operation(method));
        if (condition == Condition.disabled) {
            operation.$(By.cssSelector(".pf-v5-c-data-list__item-content svg")).should(Condition.exist);
        }
        operation.$(EXPAND_BUTTON).click();

        operation.$(EXECUTE_BUTTON).shouldBe(condition);
    }

    private By operation(String method) {
        return ByUtils.byAttribute("li", "aria-labelledby", "operation " + method);
    }
}
