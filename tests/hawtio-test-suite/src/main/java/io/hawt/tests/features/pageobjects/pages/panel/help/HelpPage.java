package io.hawt.tests.features.pageobjects.pages.panel.help;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Condition.empty;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import io.hawt.tests.features.pageobjects.pages.HawtioPage;

public class HelpPage extends HawtioPage {
    public void switchTab(String tab) {
        $(byXpath("//div[@class='pf-v5-c-page__main-nav']//a[text()='" + tab + "']")).shouldBe(interactable).click();
    }

    public void checkContent() {
        $("div .pf-v5-c-content h2").shouldNotBe(empty);
        $$("div .pf-v5-c-content p").shouldHave(sizeGreaterThanOrEqual(1));
    }
}
