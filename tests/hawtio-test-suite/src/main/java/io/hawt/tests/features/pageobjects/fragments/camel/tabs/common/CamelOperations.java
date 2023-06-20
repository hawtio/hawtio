package io.hawt.tests.features.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Operations Tab page in Camel.
 */
public class CamelOperations extends CamelPage {
    /**
     * Open some method window and execute it.
     *
     * @param method method name
     */
    public void executeMethod(String method) {
        final SelenideElement operation = $(byXpath(".//li[@aria-labelledby='operation " + method + "']"));

        // Expand the operation section
        operation.$(byXpath(".//button[@aria-label='Details']")).shouldBe(enabled).click();

        // Click on Execute of the given expanded operation section
        operation.$(byXpath(".//button[text()='Execute']")).shouldBe(enabled).click();
    }

    /**
     * Check the result of executed operation.
     *
     * @param method name of executed operation
     * @param result expected result of an operation
     */
    public void checkResultOfExecutedOperation(String method, String result) {
        final SelenideElement operation = $(byXpath(".//li[@aria-labelledby='operation " + method + "']"));
        operation.$(byXpath(".//pre")).shouldHave(exactText(result));
    }
}
