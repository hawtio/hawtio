package io.hawt.tests.utils.stepdefinitions.menu;

import io.cucumber.java.en.Given;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.utils.pageobjects.pages.quartz.QuartzPage;
import io.hawt.tests.utils.pageobjects.pages.runtime.RuntimePage;

public class LeftSideMenuStepDefs {
    private CamelPage camelPage;
    private QuartzPage quartzPage;
    private RuntimePage runtimePage;
    private HawtioPage hawtioPage = new HawtioPage();

    @Given("^User is on Hawtio main page$")
    public void userIsOnHawtioMainPage() {
        hawtioPage = new HawtioPage();
    }

    @Given("^User clicks on Camel tab in the left-side menu$")
    public void userClicksOnCamelTabInTheLeftSideMenu() {
        camelPage = hawtioPage.menu().camel();
    }

    @Given("^User clicks on Quartz tab in the left-side menu$")
    public void userClicksOnQuartzTabInTheLeftSideMenu() {
        quartzPage = hawtioPage.menu().quartz();
    }

    @Given("^User clicks on Runtime tab in the left-side menu$")
    public void userClicksOnRuntimeTabInTheLeftSideMenu() {
        runtimePage = hawtioPage.menu().runtime();
    }
}
