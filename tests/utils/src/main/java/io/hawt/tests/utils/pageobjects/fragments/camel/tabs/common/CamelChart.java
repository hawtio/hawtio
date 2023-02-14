package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class CamelChart extends HawtioPage {
    /**
     * Click on edit button.
     */
    public void edit() {
//        Selenide.refresh();
        clickButton("Edit");
    }

    /**
     * Mark the attribute, which you want for view mode.
     *
     * @param attribute of the chart
     * @return camel chart edit page
     */
    public CamelChart selectChart(String attribute) {
        $(byXpath("//option[@label='" + attribute + "']")).shouldBe(visible).doubleClick();
        return this;
    }

    /**
     * Click on view chart button.
     *
     * @return camel chart view page
     */
    public CamelChart viewChart() {
        clickButton("View Chart");
        return this;
    }

    /**
     * Assert that the name of specific attribute is displayed.
     *
     * @param attributeName of specific attribute to be displayed
     * @return camel chart view page
     */
    public CamelChart checkSpecificAttributeIsDisplayed(String attributeName) {
        getTitles().findBy(text(attributeName)).shouldBe(visible);
        return this;
    }

    /**
     * Assert that the values of tested attribute and from the chart are the same.
     *
     * @param attribute name of tested attribute
     * @param value     string value of tested attribute
     * @return camel chart view page
     */
    public CamelChart checkStringAttributeValue(String attribute, String value) {
        getValue(attribute).shouldHave(exactText(value));
        return this;
    }

    /**
     * Get the list of attributes from chart.
     *
     * @return list of attributes
     */
    private ElementsCollection getTitles() {
        return $$(byXpath("//div[@class='horizon']//span[@class='title']")).shouldHave(sizeGreaterThan(0));
    }

    /**
     * Get the value of attribute in chart.
     *
     * @param attribute name of tested attribute
     * @return value of attribute
     */
    private SelenideElement getValue(String attribute) {
        return $(byXpath("//span[text() = '" + attribute + "']/ancestor::div[1]/span[@class = 'value']")).shouldBe(visible);
    }
}
