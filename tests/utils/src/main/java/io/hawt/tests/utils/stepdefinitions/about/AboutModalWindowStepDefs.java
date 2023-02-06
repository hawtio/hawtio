package io.hawt.tests.utils.stepdefinitions.about;

import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;

public class AboutModalWindowStepDefs {
    @Then("^The \"([^\"]*)\" header is presented in About modal window$")
    public void aboutModalWindowHeaderIsPresented(String header) {
        $(byXpath("//h1[@class='pf-c-title pf-m-4xl ng-binding']")).shouldHave(exactText(header));
    }

    @And("^The \"([^\"]*)\" is presented in About modal window$")
    public void hawtioComponentIsPresented(String hawtioComponent) {
        $(byXpath("//dt[normalize-space(text())='" + hawtioComponent + "']")).shouldBe(visible);
    }
}
