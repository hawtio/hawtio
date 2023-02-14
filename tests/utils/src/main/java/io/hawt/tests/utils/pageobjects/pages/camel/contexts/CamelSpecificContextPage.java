package io.hawt.tests.utils.pageobjects.pages.camel.contexts;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import org.openqa.selenium.By;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelChart;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelTypeConverters;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

public class CamelSpecificContextPage extends CamelPage {

    public CamelAttributes attributes() {
        return openTab("Attributes", CamelAttributes.class);
    }

    public CamelTypeConverters typeConverters() {
        return openTab("Type Converters", CamelTypeConverters.class);
    }

    public CamelOperations operations() {
        return openTab("Operations", CamelOperations.class);
    }

    public CamelChart chart() {
        return openTab("Chart", CamelChart.class);
    }

    /**
     * Set the action for context in the dropdown in upper right corner.
     *
     * @param action Action to set
     * @return context page
     */
    public CamelSpecificContextPage setAction(ContextAction action) {
        $("#dropdownMenu1").shouldBe(visible).click();
        $(By.linkText(action.toString())).shouldBe(visible).click();
        return this;
    }

    /**
     * Check, that state of the context contains correct text.
     *
     * @param state in which should be context
     * @return CamelSpecificContextMainPage
     */
    public CamelSpecificContextPage checkState(String state) {
        getCamelActionsDropdown().shouldHave(text(state));
        return this;
    }

    private SelenideElement getCamelActionsDropdown() {
        return $(byXpath("//div[@class = 'dropdown camel-main-actions']")).shouldBe(enabled);
    }

    /**
     * Actions, which can be set on upper
     * right corner on context page.
     */
    public enum ContextAction {
        START {
            public String toString() {
                return "Start";
            }
        },
        SUSPEND {
            public String toString() {
                return "Suspend";
            }
        },
        DELETE {
            public String toString() {
                return "Delete";
            }
        },
    }
}
