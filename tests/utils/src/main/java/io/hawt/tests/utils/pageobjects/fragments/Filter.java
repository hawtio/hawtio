package io.hawt.tests.utils.pageobjects.fragments;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selenide.$;

public class Filter {
    /**
     * Filter for inputs with arbitrary values.
     *
     * @param nameOfFilter name of option for filtering
     * @param value        value for input
     * @return filter fragment
     */
    public Filter filterByString(String nameOfFilter, String value) {
        chooseFilter(nameOfFilter);
        setValueToFilterInput(value);
        return this;
    }

    /**
     * Select the filter option from dropdown.
     *
     * @param nameOfFilter filter option to select
     */
    private void chooseFilter(String nameOfFilter) {
        $("button[class*='filter-fields']").shouldBe(visible).click();
        $(byLinkText(nameOfFilter)).shouldBe(visible).click();
    }

    /**
     * Set value in filter input.
     *
     * @param value to be used in the filter
     * @return filter
     */
    public Filter setValueToFilterInput(String value) {
        $("div[class*='filter-fields']  input").shouldBe(visible).setValue(value).pressEnter();
        return this;
    }

    /**
     * Filter for inputs from dropdown select.
     *
     * @param nameOfFilter name of option for filtering
     * @param enumValue    enum value for input
     * @return filter fragment
     */
    public Filter filterByEnum(String nameOfFilter, String enumValue) {
        chooseFilter(nameOfFilter);
        $("span[class='filter-option pull-left ng-binding']").shouldBe(visible).click();
        $(byLinkText(enumValue)).shouldBe(visible).click();
        return this;
    }
}
