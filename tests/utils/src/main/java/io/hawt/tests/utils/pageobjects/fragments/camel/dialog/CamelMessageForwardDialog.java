package io.hawt.tests.utils.pageobjects.fragments.camel.dialog;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints.CamelBrowse;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class CamelMessageForwardDialog extends HawtioPage {
    public CamelMessageForwardDialog setUri(String uri) {
        $(byXpath("//input[@id='endpointUri']")).shouldBe(visible).setValue(uri);
        return this;
    }

    public CamelBrowse submit() {
        clickButton("Forward");
        return page(CamelBrowse.class);
    }
}
