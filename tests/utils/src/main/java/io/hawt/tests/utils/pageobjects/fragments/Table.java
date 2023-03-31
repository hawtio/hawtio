package io.hawt.tests.utils.pageobjects.fragments;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import org.openqa.selenium.NotFoundException;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

public class Table {
    /**
     * Get desired column of table.
     *
     * @param headerName variable is used to find desired column
     * @return desired column
     */
    public ElementsCollection getColumn(String headerName) {
        final int position = getColumnsPosition(headerName);
        return $$("tbody tr td:nth-child(" + position + ")");
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
     * Get row of table.
     * The method works with most tables except Attributes table.
     *
     * @param value variable is used to find desired row
     * @return desired row
     */
    public SelenideElement getRowByValue(String value) {
        return $(byXpath(".//*[contains(text(), '" + value + "')]//ancestor::tr")).shouldBe(visible);
    }

    /**
     * Get row position in a table.
     *
     * @param rowPosition variable is used to find desired row position
     * @return desired row
     */
    public SelenideElement getRowByPosition(int rowPosition) {
        return $(byXpath(".//tbody/tr[" + rowPosition + "]"));
    }

    /**
     * Get row of Attributes table.
     * The method works with Attributes table.
     *
     * @param attribute variable is used to find desired row
     * @return desired row
     */
    public SelenideElement getRowInAttributesTable(String attribute) {
        return $(byXpath("//*[@title='" + attribute + "']//ancestor::tr")).shouldBe(visible);
    }

    /**
     * Check whether filtered correctly.
     *
     * @param filterValue      value which filters.
     * @param elementsToFilter to be checked
     * @return table
     */
    public Table checkFiltered(String filterValue, ElementsCollection elementsToFilter) {
        for (int i = 0; i < elementsToFilter.size(); i++) {
            if (elementsToFilter.get(i).text().toLowerCase().contains(filterValue.toLowerCase())) {
                elementsToFilter.get(i).shouldBe(visible);
            } else {
                elementsToFilter.get(i).shouldNotBe(visible);
            }
        }
        return this;
    }

    /**
     * Clear all filters.
     */
    public void clearAllFilters() {
        $(byXpath("//a[contains(text(),'Clear All Filters')]")).shouldBe(visible).click();
        $(byXpath("//p[contains(text(),'Active Filters:')]")).shouldNotBe(visible);
    }

    /**
     * Get cell in a given row.
     *
     * @param headerName  header name of the given column
     * @param rowPosition row position of the given row
     * @return selenide element of the cell
     */
    public SelenideElement getCellInRow(String headerName, int rowPosition) {
        final SelenideElement row = getRowByPosition(rowPosition);
        final int position = getColumnsPosition(headerName);
        return row.$(byXpath(".//td[" + position + "]"));
    }
}
