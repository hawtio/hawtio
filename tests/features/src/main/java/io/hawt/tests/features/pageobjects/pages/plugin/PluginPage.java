package io.hawt.tests.features.pageobjects.pages.plugin;

import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Selenide.$;
import io.hawt.tests.features.pageobjects.pages.HawtioPage;

public class PluginPage extends HawtioPage {
    public void checkTitle(String title) {
        $("div .pf-c-content h1").shouldHave(exactText(title));
    }

    public void checkContentParagraph(String content) {
        $("div .pf-c-content p").shouldHave(exactText(content));
    }
}
