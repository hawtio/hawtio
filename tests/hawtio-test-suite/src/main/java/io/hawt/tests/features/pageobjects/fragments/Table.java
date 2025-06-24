package io.hawt.tests.features.pageobjects.fragments;

import static com.codeborne.selenide.CollectionCondition.containExactTextsCaseSensitive;
import static com.codeborne.selenide.CollectionCondition.exactTextsCaseSensitive;
import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Condition.attribute;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byTagAndText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import org.openqa.selenium.NotFoundException;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

import java.util.Collections;
import java.util.List;

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

    /**
     * Check that column contains the value.
     *
     * @param headerName of the column to be checked
     * @param value to be checked if it is under the column
     */
    public void checkColumnHasValue(String headerName, String value) {
        getColumn(headerName).findBy(exactText(value)).shouldBe(visible);
    }

    /**
     * Sort Attributes ascending and descending accordingly.
     *
     * @param desiredOrder how to sort the attributes
     * @param headerName   column to be sorted out
     */
    public void sortAttributes(String desiredOrder, String headerName) {
        final SelenideElement header = $(byTagAndText("span", headerName)).shouldBe(visible);
        final String currentOrder = header.ancestor("th").getAttribute("aria-sort");
        ElementsCollection attributeColumn = $$(byXpath("//td[1]")).shouldBe(sizeGreaterThanOrEqual(1));

        // Get a current list of attributes
        List<String> expectedList = attributeColumn.texts();

        // Sort the current list of attributes to be compared with a list in Hawtio UI
        if ("ascending".equals(desiredOrder)) {
            Collections.sort(expectedList);
        } else {
            Collections.reverse(expectedList);
        }

        // Sort the list of attributes in Hawtio UI if the order differs
        if (!desiredOrder.equals(currentOrder)) {
            header.click();
        }

        // Ensure the order is correct and the attributes lists match each other
        header.ancestor("th").shouldHave(attribute("aria-sort", desiredOrder));
        attributeColumn.shouldHave(exactTextsCaseSensitive(expectedList));
    }
}
