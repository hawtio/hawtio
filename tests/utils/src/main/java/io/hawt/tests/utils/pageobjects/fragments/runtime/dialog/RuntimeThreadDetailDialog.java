package io.hawt.tests.utils.pageobjects.fragments.runtime.dialog;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;

import org.openqa.selenium.By;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.fragments.runtime.tabs.RuntimeThreads;

public class RuntimeThreadDetailDialog {
    private final SelenideElement threadDialog = $(".modal-content");

    /**
     * Check the correctness of thread ID on dialog page.
     *
     * @param id id from the main thread table
     * @return thread dialog
     */
    public RuntimeThreadDetailDialog checkID(String id) {
        $(byXpath(".//dl[@class='dl-horizontal']//dd[contains(text(), '" + id + "')]")).shouldBe(visible);
        return this;
    }

    /**
     * Check the correctness of thread name on dialog page.
     *
     * @param name of the thread
     * @return thread dialog
     */
    public RuntimeThreadDetailDialog checkName(String name) {
        $(byXpath(".//dl[@class='dl-horizontal']//dd[contains(text(), '" + name + "')]")).shouldBe(visible);
        return this;
    }

    /**
     * Close the thread log dialog.
     *
     * @return thread main page
     */
    public RuntimeThreads closeTheLogDialog() {
        threadDialog.find(By.xpath(".//span[@class='pficon pficon-close']")).shouldBe(visible).click();
        return page(RuntimeThreads.class);
    }
}
