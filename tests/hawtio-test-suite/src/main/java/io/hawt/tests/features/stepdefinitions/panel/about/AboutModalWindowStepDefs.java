package io.hawt.tests.features.stepdefinitions.panel.about;

import static org.assertj.core.api.Assertions.assertThat;

import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import org.assertj.core.api.Assertions;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.hawt.tests.features.pageobjects.fragments.about.AboutModalWindow;

public class AboutModalWindowStepDefs {
    @Then("^The \"([^\"]*)\" header is presented in About modal window$")
    public void aboutModalWindowHeaderIsPresented(String header) {
        assertThat(new AboutModalWindow().getHeaderText()).isEqualTo(header);
    }

    @And("^The \"([^\"]*)\" is presented in About modal window$")
    public void hawtioComponentIsPresented(String hawtioComponent) {
        assertThat(new AboutModalWindow().getAppComponents()).containsKey(hawtioComponent);
    }
}
