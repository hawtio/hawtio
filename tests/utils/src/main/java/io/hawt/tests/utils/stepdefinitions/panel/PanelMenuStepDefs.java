package io.hawt.tests.utils.stepdefinitions.panel;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.about.AboutModalWindow;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class PanelMenuStepDefs {
    private final static HawtioPage hawtioPage = new HawtioPage();
    private final AboutModalWindow aboutModalWindow = new AboutModalWindow();

    @When("^User clicks on \"([^\"]*)\" option in Question mark drop-down menu$")
    public void userClicksOnAboutOptionInQuestionMarkDropDownMeu(String option) {
        hawtioPage.panel().openMenuItemUnderQuestionMarkDropDownMenu(option);
    }

    @Then("^About modal window is closed$")
    public void aboutDialogIsClosed() {
        aboutModalWindow.close();
    }
}
