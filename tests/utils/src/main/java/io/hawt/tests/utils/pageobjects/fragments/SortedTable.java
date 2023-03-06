package io.hawt.tests.utils.pageobjects.fragments;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import org.junit.Assert;

import org.openqa.selenium.By;

import com.codeborne.selenide.ElementsCollection;

import java.util.List;
import java.util.Objects;

public class SortedTable extends Table {
    /**
     * Sorts the table by given column in ascending order.
     *
     * @param headerName name of the column for sorting
     * @return threads main page
     */
    public SortedTable ascendingSortBy(String headerName) {
        sort(headerName, "ascending");
        return this;
    }

    /**
     * Sorts the table by given column in descending order.
     *
     * @param headerName name of the column for sorting
     * @return threads main page
     */
    public SortedTable descendingSortBy(String headerName) {
        sort(headerName, "descending");
        return this;
    }

    /**
     * Sort the table in given order option by clicking on header of column.
     *
     * @param headerName  column, according to which is sorting performed
     * @param orderOption two options - ascending or descending
     */
    private void sort(String headerName, String orderOption) {
        //we have to do the first click to ensure, that the sort of column has started
        $(By.xpath("//th[contains(text(), '" + headerName + "')]")).shouldBe(visible).click();
        if (Objects.requireNonNull($(byXpath("//th[contains(text(), '" + headerName + "')]")).getAttribute("aria-label")).contains(orderOption)) {
            $(byXpath("//th[contains(text(), '" + headerName + "')]")).shouldBe(visible).click();
        }
    }

    public SortedTable checkSortedByText(ElementsCollection collumn, boolean ascendant) {
        final List<String> elementsToFilter = collumn.texts();

        if (ascendant) {
            for (int i = 0; i < elementsToFilter.size() - 1; i++) {
                if (elementsToFilter.get(i).compareToIgnoreCase(elementsToFilter.get(i + 1)) > 0) {
                    Assert.fail("Elements " + elementsToFilter.get(i) + " and " + elementsToFilter.get(i + 1) + " are not sorted ascendant");
                }
            }
        } else {
            for (int i = 0; i > elementsToFilter.size() - 1; i++) {
                if (elementsToFilter.get(i).compareToIgnoreCase(elementsToFilter.get(i + 1)) < 0) {
                    Assert.fail("Elements " + elementsToFilter.get(i) + " and " + elementsToFilter.get(i + 1) + " are sorted ascendant");
                }
            }
        }
        return this;
    }

    public SortedTable checkSortedByInteger(ElementsCollection column, boolean ascendant) {
        final List<String> elementsToFilter = column.texts();

        if (ascendant) {
            for (int i = 0; i < elementsToFilter.size() - 1; i++) {
                if (Integer.parseInt(elementsToFilter.get(i)) > Integer.parseInt(elementsToFilter.get(i + 1))) {
                    Assert.fail("Elements " + elementsToFilter.get(i) + " and " + elementsToFilter.get(i + 1) + " are not sorted ascendent");
                }
            }
        } else {
            for (int i = 0; i < elementsToFilter.size() - 1; i++) {
                if (Integer.parseInt(elementsToFilter.get(i)) < Integer.parseInt(elementsToFilter.get(i + 1))) {
                    Assert.fail("Elements " + elementsToFilter.get(i) + " and " + elementsToFilter.get(i + 1) + " are sorted ascendent");
                }
            }
        }
        return this;
    }
}
