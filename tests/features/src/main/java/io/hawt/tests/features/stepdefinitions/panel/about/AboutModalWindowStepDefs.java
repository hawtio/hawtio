package io.hawt.tests.features.stepdefinitions.panel.about;

import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;

public class AboutModalWindowStepDefs {
    @Then("^The \"([^\"]*)\" header is presented in About modal window$")
    public void aboutModalWindowHeaderIsPresented(String header) {
        $("#pf-about-modal-title-0").shouldHave(exactText(header));
    }

    @And("^The \"([^\"]*)\" is presented in About modal window$")
    public void hawtioComponentIsPresented(String hawtioComponent) {
        $(byXpath("//dt[normalize-space(text())='" + hawtioComponent + "']")).should(exist);
    }
}
