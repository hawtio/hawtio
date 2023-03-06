package io.hawt.tests.utils.pageobjects.fragments.quartz.tabs;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import java.util.Objects;

import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class QuartzScheduler extends HawtioPage {

    public QuartzScheduler checkInfoStatusIsPresented() {
        $$(byXpath(".//div[contains(@class, 'card-pf card-pf-info-status')]")).shouldHave(sizeGreaterThan(0));
        $$(byXpath(".//dl[contains(@class, 'dl-horizontal')]")).shouldHave(sizeGreaterThan(0));
        return this;
    }

    public QuartzScheduler actionField(String action, String field) {
        $(byXpath(".//h3[contains(text(),'" + field + "')]/following-sibling::div/button[contains(text(), '" + action + "')]")).shouldBe(enabled).click();
        return this;
    }

    public boolean fieldIsInState(String field, String state) {
        return Objects.requireNonNull($(byXpath("//h3[contains(text(), '" + field + "')]/parent::div/preceding-sibling::div/span")).getAttribute("class")).contains(state);
    }
}
