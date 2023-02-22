package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints;

import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import io.hawt.tests.utils.pageobjects.fragments.camel.dialog.CamelMessageForwardDialog;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Represents Browse Tab page in Camel.
 */
public class CamelBrowse extends HawtioPage {
    private final CamelMessageForwardDialog camelMessageForwardDialog;

    public CamelBrowse() {
        camelMessageForwardDialog = new CamelMessageForwardDialog();
    }

    public CamelBrowse openMessageById(String messageId) {
        $(byXpath("//a[contains(text(), '" + messageId + "')]")).shouldBe(visible).click();
        return this;
    }

    public CamelBrowse checkMessageById(String messageId) {
        $(byXpath("//dt[contains(text(), 'ID')]/ancestor::dl/dd")).shouldBe(visible).shouldHave(text(messageId));
        return this;
    }

    public CamelBrowse closeMessage() {
        $(byXpath("//div[@class='modal-content']//button[@class='close']")).shouldBe(visible).click();
        return this;
    }

    public CamelBrowse selectByName(String msgName) {
        $(byXpath("//a[contains(text(), '" + msgName + "')]/ancestor::tr//input[@type='checkbox']")).shouldBe(visible).click();
        return this;
    }

    public CamelMessageForwardDialog forward() {
        clickButton("Forward");
        return camelMessageForwardDialog;
    }
}
