package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints;

import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Represents Send Tab page in Camel.
 */
public class CamelSend extends HawtioPage {
    public CamelSend addHeader(String name, String value) {
        $(byLinkText("Add header")).click();
        $(byXpath("(//input[@ng-model='header.name'])[last()]")).setValue(name).click();
        $(byXpath("(//input[@ng-model='header.value'])[last()]")).setValue(value).click();
        return this;
    }

    public CamelSend writeBody(String body) {
        final SelenideElement codeMirror = $(byXpath("//div[contains(@class, 'CodeMirror')]"));
        codeMirror.click();
        Selenide.executeJavaScript("arguments[0].CodeMirror.setValue('" + body + "');", codeMirror);
        return this;
    }

    public CamelSend sendMessage() {
        clickButton("Send message");
        return this;
    }
}
