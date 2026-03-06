package io.hawt.tests.features.pageobjects.pages.panel.help;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Condition.empty;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import org.openqa.selenium.By;

import io.hawt.tests.features.pageobjects.pages.HawtioPage;
import io.hawt.tests.features.utils.ByUtils;

public class HelpPage extends HawtioPage {
    public void switchTab(String tab) {
        $(By.cssSelector("main nav.pf-v6-c-nav")).$(ByUtils.byExactText(tab)).shouldBe(interactable).click();
        $("div .pf-v6-c-content h2").shouldNotBe(empty);
    }

    public void checkContent() {
        $("div .pf-v6-c-content h2").shouldNotBe(empty);
        $$("div .pf-v6-c-content p").shouldHave(sizeGreaterThanOrEqual(1));
    }
}
