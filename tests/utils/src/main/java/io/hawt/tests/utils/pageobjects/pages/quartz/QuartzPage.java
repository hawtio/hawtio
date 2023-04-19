package io.hawt.tests.utils.pageobjects.pages.quartz;

import static com.codeborne.selenide.Condition.cssClass;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.hidden;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;

import io.hawt.tests.utils.pageobjects.fragments.quartz.QuartzTree;

public class QuartzPage {
    private final QuartzTree quartzTree;

    public QuartzPage() {
        quartzTree = new QuartzTree();
    }

    public QuartzTree quartzTree() {
        return quartzTree;
    }

    public <C> C openTab(String tab, Class<C> c) {
        final SelenideElement tabElement = $(byXpath("//a[text()='" + tab + "']"));

        // if the tab is active, return the page
        if (tabElement.$(byXpath("parent::li")).has(cssClass("active"))) {
            return page(c);
        }

        // if the tabs are not displayed, refresh the page
        if (!tabElement.isDisplayed()) {
            Selenide.refresh();
        }

        tabElement.should(exist).shouldBe(enabled).click();
        return page(c);
    }
}
