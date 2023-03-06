package io.hawt.tests.utils.pageobjects.fragments.quartz.dialog;

import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.fragments.quartz.tabs.QuartzJobs;

public class QuartzJobDataMapDetailDialog {
    private final SelenideElement dialog = $(".modal-content");

    /**
     * Close the detail dialog.
     *
     * @return quartz jobs page
     */
    public QuartzJobs closeTheDetailDialog() {
        dialog.find(byXpath(".//span[@class='pficon pficon-close']")).shouldBe(visible).click();
        return page(QuartzJobs.class);
    }

    /**
     * Check the key and the value of the Quartz Job DataMap detail dialog.
     *
     * @param key   of the job data map
     * @param value of the job data map
     * @return quartz job dataMap detail dialog
     */
    public QuartzJobDataMapDetailDialog checkKeyValue(String key, String value) {
        $(byXpath("//td[contains(text(), '" + key + "')]//following-sibling::td")).shouldBe(visible).shouldHave(exactText(value));
        return page(QuartzJobDataMapDetailDialog.class);
    }
}
