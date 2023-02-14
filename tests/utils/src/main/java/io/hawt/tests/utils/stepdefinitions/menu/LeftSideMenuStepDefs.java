package io.hawt.tests.utils.stepdefinitions.menu;

import io.cucumber.java.en.Given;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;

public class LeftSideMenuStepDefs {
    private CamelPage camelPage;
    private HawtioPage hawtioPage = new HawtioPage();

    @Given("^User is on Hawtio main page$")
    public void userIsOnHawtioMainPage() {
        hawtioPage = new HawtioPage();
    }

    @Given("^User clicks on Camel tab in the left-side menu$")
    public void userClicksOnCamelTabInTheLeftSideMenu() {
        camelPage = hawtioPage.menu().camel();
    }
}
