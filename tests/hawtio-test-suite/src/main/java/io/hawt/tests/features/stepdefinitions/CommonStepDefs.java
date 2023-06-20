package io.hawt.tests.features.stepdefinitions;

import io.cucumber.java.en.And;
import io.hawt.tests.features.pageobjects.pages.HawtioPage;

public class CommonStepDefs {
    private static final HawtioPage hawtioPage = new HawtioPage();

    @And("^Successful alert message is appeared and closed$")
    public void successfulAlertMessageIsAppearedAndClosed() {
        hawtioPage.successfulAlertMessage().closeAlertMessage();
    }

    @And("^Unsuccessful alert message is appeared and closed$")
    public void unsuccessfulAlertMessageIsAppearedAndClosed() {
        hawtioPage.unsuccessfulAlertMessage().closeAlertMessage();
    }
}
