package io.hawt.tests.features.pageobjects.pages.preferences;

import io.hawt.tests.features.pageobjects.pages.HawtioPage;
import io.hawt.tests.features.utils.ByUtils;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Condition.empty;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selenide.$;

public class PreferencesPage extends HawtioPage {
    public void switchTab(String tab) {
        $(By.cssSelector("main nav.pf-v6-c-nav")).$(ByUtils.byExactText(tab)).shouldBe(interactable).click();
        $(".pf-v6-c-page__main-section").shouldNotBe(empty);
    }

    public void checkContent() {
        $("div .pf-v6-c-form").shouldNotBe(empty);
    }
}
