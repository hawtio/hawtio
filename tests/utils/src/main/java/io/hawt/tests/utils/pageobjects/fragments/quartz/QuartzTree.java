package io.hawt.tests.utils.pageobjects.fragments.quartz;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;

public class QuartzTree {

    /**
     * Expand specific Quartz Scheduler in a Quartz Scheduler tree.
     *
     * @param pageObjectClass
     * @param scheduler       name of a scheduler containing a node
     * @return page of a given class
     */
    public <P> P expandSpecificScheduler(Class<P> pageObjectClass, String scheduler) {
        $(byXpath("//li[@id='" + scheduler + "']")).shouldBe(visible).click();
        return page(pageObjectClass);
    }
}
