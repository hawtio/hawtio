package io.hawt.tests.features.pageobjects.fragments;

import static com.codeborne.selenide.CollectionCondition.containExactTextsCaseSensitive;
import static com.codeborne.selenide.CollectionCondition.exactTextsCaseSensitive;
import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Condition.attribute;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Selectors.byTagAndText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.CollectionCondition.allMatch; 

import org.openqa.selenium.NotFoundException;

import io.hawt.tests.features.pageobjects.pages.HawtioPage;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represent a common Table used in Hawtio with common methods.
 */
public class Table {
    private final HawtioPage hawtioPage = new HawtioPage();

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
     * Check that all values in a specific column are integers.
     * @param headerName column to be checked
    */
    public void checkColumnHasIntegerValues(String headerName) {
        getColumn(headerName).should(allMatch( "All values must be integers", cell -> cell.getText().matches("-?\\d+")));
    } 

    /**
     * Check existing filters and applies a new search.
     * @param filter the category to select (e.g., "URL", "Route ID")
     * @param value the search string
     */    

    public void addFilter(String filter, String value) {
        clearFilter();
        selectFilter(filter);
        searchFor(value);
        hawtioPage.clickButton("Add Filter");    
    }

    /**
     * Clears existing filters if the button is visible and enabled.
     */
    public void clearFilter() {
        final SelenideElement clearFilterButton = $(byTagAndText("button", "Clear all filters"));
        if (clearFilterButton.is(visible)) {
            hawtioPage.clickButtonByTagAndText("button", "Clear all filters");
        }
    }

    /**
     * Opens the category dropdown and selects the filter type.
     */
    public void selectFilter(String filter) {
        hawtioPage.clickButtonByDataTestId("attribute-select-toggle");
        $$(".pf-v6-c-menu button, .pf-v6-c-dropdown button")
            .findBy(exactText(filter))
            .shouldBe(visible, enabled)
            .click();
    }

    /**
     * Enters search text into the search input.
     */
    public void searchFor(String value) {
        final SelenideElement searchInput = $("input[aria-label='Search input']").shouldBe(visible);
        searchInput.clear();
        searchInput.setValue(value).pressEnter();
    }    

    /**
     * Sort Attributes ascending and descending accordingly.
     *
     * @param desiredOrder how to sort the attributes
     * @param headerName   column to be sorted out
     */
    public void sortAttributes(String desiredOrder, String headerName) {
        final SelenideElement header = $$("th").findBy(text(headerName)).$("span").shouldBe(visible);
        final String currentOrder = header.ancestor("th").getAttribute("aria-sort");

        // Click to achieve desired order if needed
        if (!desiredOrder.equals(currentOrder)) {
            header.click();
            String newOrder = header.ancestor("th").getAttribute("aria-sort");
            
            // Handle three-state toggles (None -> Ascending -> Descending)
            if ("descending".equals(desiredOrder) && "ascending".equals(newOrder)) {
                header.click();
            }
        }

        // Verify the header shows correct sort state
        header.ancestor("th").shouldHave(attribute("aria-sort", desiredOrder));

        // Fetch the sorted column data (after UI has updated)
        int colIndex = getColumnsPosition(headerName);
        ElementsCollection attributeColumn = $$(byXpath("//tbody/tr/td[" + colIndex + "]"))
                .shouldBe(sizeGreaterThanOrEqual(1));

        // Create expected sorted list from current values
        List<String> expectedList = new ArrayList<>(attributeColumn.texts());
        if ("ascending".equals(desiredOrder)) {
            Collections.sort(expectedList);
        } else {
            Collections.sort(expectedList, Collections.reverseOrder());
        }

        // Verify UI matches expected sort
        attributeColumn.shouldHave(exactTextsCaseSensitive(expectedList));
    }
}
