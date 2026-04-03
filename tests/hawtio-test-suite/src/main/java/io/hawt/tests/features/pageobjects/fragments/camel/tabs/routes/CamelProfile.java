package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import io.hawt.tests.features.pageobjects.fragments.Table;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

import static com.codeborne.selenide.CollectionCondition.allMatch;

/**
 * Represents Profile Tab page in Camel.
 */
public class CamelProfile extends CamelPage {

    private final Table table = new Table();

    /** Ensure that all values in column are not empty and the column values are positive integers. */
    public void columnHasIntegerValues(String columnName) {
        table.checkColumnIsNotEmpty(columnName);
        table.getColumn(columnName)
             .should(allMatch("All values must be integers",
                               cell -> cell.getText().matches("-?\\d+")));
    }
    /**
     * Check ID column for specific values.
     */

    public void columnHasValues(String columnName, String expectedValues) {
        if (expectedValues == null || expectedValues.isEmpty()) {
            columnHasIntegerValues(columnName);
        } else {
            for (String value : expectedValues.split(",")) {
                table.checkColumnHasValue(columnName, value);
            }
        }
    }
}

