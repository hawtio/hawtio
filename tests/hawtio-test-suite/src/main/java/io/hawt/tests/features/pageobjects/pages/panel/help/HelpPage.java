package io.hawt.tests.features.pageobjects.pages.panel.help;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Condition.empty;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static io.hawt.tests.features.utils.ByUtils.byAttribute;
import static io.hawt.tests.features.utils.ByUtils.byText;
import io.hawt.tests.features.pageobjects.pages.HawtioPage;

public class HelpPage extends HawtioPage {
    public void switchTab(String tab) {
        $(byAttribute("nav", "aria-label", "Nav")).$(byText("a", tab)).shouldBe(interactable).click();
    }

    public void checkContent() {
        $("div .pf-v5-c-content h2").shouldNotBe(empty);
        $$("div .pf-v5-c-content p").shouldHave(sizeGreaterThanOrEqual(1));
    }
}
