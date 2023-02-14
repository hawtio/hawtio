package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Camel Operations tab
 */
public class CamelOperations extends HawtioPage {
    /**
     * Open some method window and execute it.
     *
     * @param method method name
     * @return camel operations page
     */
    public CamelOperations executeMethod(String method) {
        $(byText(method)).shouldBe(visible).click();
        final SelenideElement expandedMethodPanel = $(byText(method)).$(byXpath(".//ancestor::div[@class = 'list-group-item  list-view-pf-expand-active']"));
        //click on the Execute button in expanded panel of the chosen method.
        expandedMethodPanel.$(byXpath(".//button[@type='submit']")).shouldBe(visible).click();
        return this;
    }

    /**
     * Check the result of executed operation.
     *
     * @param operation name of executed operation
     * @param result    expected result of an operation
     * @return camel operations page
     */
    public CamelOperations checkResultOfExecutedOperation(String operation, String result) {
        result(operation).shouldHave(text(result));
        return this;
    }

    /**
     * Get the result of executed method.
     *
     * @param method method name
     * @return result
     */
    public SelenideElement result(String method) {
        final SelenideElement expandedMethodPanel = $(byText(method)).$(byXpath(".//ancestor::div[@class = 'list-group-item  list-view-pf-expand-active']"));
        //get the result of the executed method. It's located in <pre> tag in expanded method panel.
        return expandedMethodPanel.$(byXpath(".//pre[contains(@class, 'ng-binding')]")).shouldBe(visible);
    }
}
