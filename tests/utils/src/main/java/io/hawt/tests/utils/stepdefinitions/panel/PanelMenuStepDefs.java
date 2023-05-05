package io.hawt.tests.utils.stepdefinitions.panel;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.about.AboutModalWindow;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class PanelMenuStepDefs {
    private final static HawtioPage hawtioPage = new HawtioPage();
    private AboutModalWindow aboutModalWindow;

    @When("^User clicks on About option in Question mark drop-down menu$")
    public void userClicksOnAboutOptionInQuestionMarkDropDownMeu() {
        aboutModalWindow = hawtioPage.panel().about();
    }

    @Then("^About modal window is closed$")
    public void aboutDialogIsClosed() {
        aboutModalWindow.close();
    }
}
