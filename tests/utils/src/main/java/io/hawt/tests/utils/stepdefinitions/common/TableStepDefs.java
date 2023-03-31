package io.hawt.tests.utils.stepdefinitions.common;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.Filter;
import io.hawt.tests.utils.pageobjects.fragments.SortedTable;
import io.hawt.tests.utils.pageobjects.fragments.Table;

public class TableStepDefs {
    private static final Filter filter = new Filter();
    private static final Table table = new Table();
    private static final SortedTable sortedTable = new SortedTable();

    @When("^User filters table by \"([^\"]*)\" of string \"([^\"]*)\"$")
    public void userFiltersTableByString(String nameOfFilter, String filteredString) {
        filter.filterByString(nameOfFilter, filteredString);
    }

    @Then("^Table is filtered by string \"([^\"]*)\" in \"([^\"]*)\" column")
    public void tableIsFilteredByStringInColumn(String filteredString, String columnName) {
        table.checkFiltered(filteredString, table.getColumn(columnName));
        table.clearAllFilters();
    }

    @When("^User filters table by \"([^\"]*)\" of enum \"([^\"]*)\"$")
    public void userFiltersTableByEnumOf(String nameOfFilter, String enumValue) {
        filter.filterByEnum(nameOfFilter, enumValue);
    }

    @When("^User sorts table ascending by \"([^\"]*)\" column$")
    public void userSortsTableAscendingByColumn(String columnName) {
        sortedTable.ascendingSortBy(columnName);
    }

    @When("^User sorts table descending by \"([^\"]*)\" column$")
    public void userSortsTableDescendingByColumn(String columnName) {
        sortedTable.descendingSortBy(columnName);
    }

    @Then("^Table is sorted ascendant \"([^\"]*)\" by \"([^\"]*)\" column by text$")
    public void tableIsSortedByText(String ascendant, String columnName) {
        sortedTable.checkSortedByText(sortedTable.getColumn(columnName), Boolean.parseBoolean(ascendant));
    }

    @Then("^Table is sorted ascendant \"([^\"]*)\" by \"([^\"]*)\" column by integer")
    public void tableIsSortedByInteger(String ascendant, String columnName) {
        sortedTable.checkSortedByInteger(sortedTable.getColumn(columnName), Boolean.parseBoolean(ascendant));
    }
}
