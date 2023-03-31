package io.hawt.tests.utils.pageobjects.fragments.runtime.tabs;

import static com.codeborne.selenide.Selenide.page;

import org.openqa.selenium.By;

import io.hawt.tests.utils.pageobjects.fragments.Table;
import io.hawt.tests.utils.pageobjects.fragments.runtime.dialog.RuntimeThreadDetailDialog;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class RuntimeThreads extends HawtioPage {
    private static final Table table = new Table();

    /**
     * Get the value of ID column from concrete thread row of table.
     *
     * @param rowPosition number of row, from which you want to get the value
     * @return ID of thread on given row
     */
    public String getIdOfThreadOnRowPosition(int rowPosition) {
        return table.getCellInRow("ID", rowPosition).getText();
    }

    /**
     * Get the value of Name column from concrete thread row of table.
     *
     * @param rowPosition number of row, from which you want to get the value
     * @return Name of thread on given row
     */
    public String getNameOfThreadOnRowPosition(int rowPosition) {
        return table.getCellInRow("Name", rowPosition).getText();
    }

    /**
     * Click on More button of  concrete thread row of table and open the Thread dialog.
     *
     * @param threadPosition number of row with thread, which you want to open
     * @return thread dialog fragment
     */
    public RuntimeThreadDetailDialog openThreadDetailDialog(int threadPosition) {
        final int actionsColumnPosition = table.getColumnsPosition("Actions");
        table.getRowByPosition(threadPosition).find(By.xpath(".//td[" + actionsColumnPosition + "]/div/button")).click();
        return page(RuntimeThreadDetailDialog.class);
    }
}
