package io.hawt.tests.utils.stepdefinitions.menu;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.about.AboutModalWindow;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class HelpDropDownMenuStepDefs {
    private final HawtioPage hawtioPage = new HawtioPage();
    private AboutModalWindow aboutModalWindow;

    @When("^User clicks on About option in About drop-down menu$")
    public void userClicksOnAboutOptionInAboutDropDownMeu() {
        aboutModalWindow = hawtioPage.panel().about();
    }

    @Then("^About modal window is closed$")
    public void aboutDialogIsClosed() {
        aboutModalWindow.close(AboutModalWindow.class);
    }
}
