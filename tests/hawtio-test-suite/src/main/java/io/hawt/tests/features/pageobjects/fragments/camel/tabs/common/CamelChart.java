package io.hawt.tests.features.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.not;
import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selectors.withTagAndText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import org.junit.jupiter.api.Assertions;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Chart Tab page in Camel.
 */
public class CamelChart extends CamelPage {
    /**
     * Click on edit button.
     *
     * @return camel chart
     */
    public CamelChart edit() {
        clickButton("Edit watches");
        return this;
    }

    /**
     * Close Edit Watches mode.
     *
     * @return camel chart
     */
    public CamelChart closeEdit() {
        clickButton("Close");
        return this;
    }

    /**
     * Unwatch all Camel Attributes under specific parent attribute.
     *
     * @param parentAttribute of all chart attributes
     */
    public void unwatchAll(String parentAttribute) {
        $(byXpath("//div[contains(@class, 'pf-m-available')]//span[text()='" + parentAttribute + "']/preceding-sibling::span/input")).shouldBe(enabled).click();
        $(byXpath("//button[@aria-label='Add selected']")).shouldBe(enabled).click();
    }

    /**
     * Watch a specific Camel Attribute.
     *
     * @param attribute to be watched
     */
    public void watch(String attribute) {
        $(byXpath("//div[contains(@class, 'pf-m-chosen')]//span[@class='pf-c-dual-list-selector__item-toggle-icon']")).shouldBe(enabled).click();
        $(byXpath("//span[text()='" + attribute + "']/preceding-sibling::span/input")).shouldBe(enabled).click();
        $(byXpath("//button[@aria-label='Remove selected']")).shouldBe(enabled).click();
    }

    /**
     * Assert that the name of specific attribute is displayed.
     *
     * @param attributeName of specific attribute to be displayed
     * @return camel chart
     */
    public CamelChart checkSpecificAttributeIsDisplayed(String attributeName) {
        getTitles().findBy(text(attributeName)).shouldBe(visible);
        return this;
    }

    /**
     * Assert that the name of specific attribute is not displayed.
     *
     * @param attributeName of specific attribute not to be displayed
     */
    public void checkSpecificAttributeIsNotDisplayed(String attributeName) {
        getTitles().findBy(text(attributeName)).shouldNotBe(visible);
    }

    /**
     * Assert that the values of tested attribute and from the chart are the same.
     *
     * @param attribute     name of tested attribute
     * @param expectedValue string value of tested attribute
     */
    public void checkStringAttributeValue(String attribute, String expectedValue) {
        Assertions.assertEquals(expectedValue, getValue(attribute));
    }

    /**
     * Get the list of attributes from chart.
     *
     * @return list of attributes
     */
    private ElementsCollection getTitles() {
        return $$(byXpath("//div[@class='pf-c-card__body']/div/div[1]")).shouldHave(sizeGreaterThan(0));
    }

    /**
     * Get the value of specific attribute from chart.
     *
     * @param attribute name of tested attribute
     * @return value of the tested attribute
     */
    private String getValue(String attribute) {
        final SelenideElement chart = $(byXpath("//div[text()='" + attribute + "']/following-sibling::*[1]/descendant::*[local-name()='g'][1]/*[local-name()='path' and string-length(@d)!=0]"));
        final SelenideElement chartBarValue = chart.$(byXpath("./ancestor::*[local-name()='g']/following-sibling::*[2]//*[local-name()='tspan']"));

        chart.should(exist).hover();

        if (chartBarValue.is(not(visible))) {
            $(withTagAndText("div", attribute)).hover();
            chart.should(exist).hover();
        }

        return chartBarValue.getText().substring(chartBarValue.getText().lastIndexOf(":") + 2);
    }
}
