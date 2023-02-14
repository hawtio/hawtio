package io.hawt.tests.utils.pageobjects.pages.camel;

import static com.codeborne.selenide.Condition.cssClass;
import static com.codeborne.selenide.Condition.not;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;

import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Represents Camel page.
 */
public class CamelPage extends HawtioPage {
    private final CamelTree camelTree;

    public CamelPage() {
        camelTree = new CamelTree();
    }

    public CamelTree camelTree() {
        return camelTree;
    }

    public <C> C openTab(String tab, Class<C> c) {
        final SelenideElement tabElement = $(byXpath("//a[text()='" + tab + "']"));

        // if the tab is active, return the page
        if (tabElement.$(byXpath("parent::li")).has(cssClass("active"))) {
            return page(c);
        }

        // if tabs are hidden, expand More dropdown menu
        if (tabElement.is(not(visible))) {
            $(byXpath("//a[@id='moreDropdown']")).shouldBe(visible).click();
        }
        tabElement.shouldBe(visible).click();
        return page(c);
    }
}
