package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Properties Tab page in Camel.
 */
public class CamelProperties extends CamelPage {
    public void checkDefaultQuartzProperties(String route, String autoStartup, String logMask, String delayer) {
        $(byXpath("//dt[span[text()='Id']]/following-sibling::dd")).shouldBe(visible).shouldHave(exactText(route));
        $(byXpath("//dt[span[text()='Auto Startup']]/following-sibling::dd")).shouldBe(visible).shouldHave(exactText(autoStartup));
        $(byXpath("//dt[span[text()='Log Mask']]/following-sibling::dd")).shouldBe(visible).shouldHave(exactText(logMask));
        $(byXpath("//dt[span[text()='Delayer']]/following-sibling::dd")).shouldBe(visible).shouldHave(exactText(delayer));
    }
}
