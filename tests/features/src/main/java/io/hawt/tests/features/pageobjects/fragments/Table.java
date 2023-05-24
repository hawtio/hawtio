package io.hawt.tests.features.pageobjects.fragments;

import static com.codeborne.selenide.CollectionCondition.containExactTextsCaseSensitive;
import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import org.openqa.selenium.NotFoundException;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

/**
 * Represent a common Table used in Hawtio with common methods.
 */
public class Table {
    /**
     * Get row of table.
     *
     * @param value variable is used to find desired row
     * @return desired row
     */
    public SelenideElement getRowByValue(String value) {
        return $(byXpath("//td[normalize-space(text())='" + value + "']//ancestor::tr")).shouldBe(interactable);
    }

    /**
     * Get desired column of table.
     *
     * @param headerName variable is used to find desired column
     * @return desired column
     */
    public ElementsCollection getColumn(String headerName) {
        return $$("tbody tr td:nth-child(" + getColumnsPosition(headerName) + ")");
    }

    /**
     * Get the column's index (position).
     *
     * @param headerName variable is used to find desired column
     * @return the index (position) of desired column
     */
    public int getColumnsPosition(String headerName) {
        final ElementsCollection headers = $$(byXpath("//thead/tr/th")).shouldBe(sizeGreaterThanOrEqual(1));
        for (int i = 0; i < headers.size(); i++) {
            if (headers.get(i).shouldBe(visible).text().equalsIgnoreCase(headerName)) {
                return i + 1;
            }
        }
        throw new NotFoundException();
    }

    /**
     * Check key and value pair in the table.
     *
     * @param key   to be checked
     * @param value to be checked
     */
    public void checkKeyAndValuePairs(String key, String value) {
        $$("table tbody tr td").should(containExactTextsCaseSensitive(key, value));
    }

    /**
     * Check that column is not empty.
     *
     * @param headerName of the column to be checked
     */
    public void checkColumnIsNotEmpty(String headerName) {
        getColumn(headerName).shouldBe(sizeGreaterThanOrEqual(1));
    }
}
