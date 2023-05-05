package io.hawt.tests.utils.stepdefinitions.menu;

import io.cucumber.java.en.Given;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class LeftSideMenuStepDefs {
    private final HawtioPage hawtioPage = new HawtioPage();

    @Given("^User is on \"([^\"]*)\" page$")
    public void userIsOnGivenPage(String page) {
        hawtioPage.menu().navigateTo(page);
    }
}
