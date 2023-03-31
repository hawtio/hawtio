package io.hawt.tests.utils.pageobjects.fragments.menu;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.utils.pageobjects.pages.quartz.QuartzPage;
import io.hawt.tests.utils.pageobjects.pages.runtime.RuntimePage;

/**
 * Represents the left-side menu.
 */
public class Menu {
    /**
     * Click on Camel option in the left-side menu.
     *
     * @return Camel page
     */
    public CamelPage camel() {
        toggleMenuIfCollapsed();
        $(byLinkText("Camel")).shouldBe(visible).click();
        return page(CamelPage.class);
    }

    /**
     * Click on Quartz option in the left-side menu.
     *
     * @return Quartz page
     */
    public QuartzPage quartz() {
        toggleMenuIfCollapsed();
        $(byLinkText("Quartz")).shouldBe(visible).click();
        return page(QuartzPage.class);
    }

    /**
     * Click on Runtime option in the left-side menu.
     *
     * @return Runtime page
     */
    public RuntimePage runtime() {
        toggleMenuIfCollapsed();
        $(byLinkText("Runtime")).shouldBe(visible).click();
        return page(RuntimePage.class);
    }

    /**
     * Toggle sidebar menu if collapsed.
     */
    public void toggleMenuIfCollapsed() {
        if ($(byXpath("//page-sidebar[contains(@class, 'f-m-collapsed')]")).exists()) {
            $(byXpath("//button[@class='pf-c-button pf-m-plain']")).shouldBe(enabled).click();
        }
    }
}
