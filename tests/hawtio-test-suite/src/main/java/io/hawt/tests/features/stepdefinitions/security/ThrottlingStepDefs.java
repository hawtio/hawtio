package io.hawt.tests.features.stepdefinitions.security;

import com.codeborne.selenide.Selenide;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.cucumber.junit.CucumberOptions;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.pageobjects.pages.ConnectPage;
import io.hawt.tests.features.pageobjects.pages.LoginPage;
import io.hawt.tests.features.setup.LoginLogout;
import org.junit.Ignore;
import org.junit.jupiter.api.Disabled;
import org.openqa.selenium.By;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.function.BiConsumer;

import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Selenide.$;

@Ignore
@Disabled
public class ThrottlingStepDefs {

    private static final Logger LOG = LoggerFactory.getLogger(ThrottlingStepDefs.class);
    private final LoginPage loginPage = new LoginPage();
    private final ConnectPage connectPage = new ConnectPage();
    private static final By WARNING = By.cssSelector(".pf-v5-c-helper-text__item-text");
    private static final By CONNECT_PAGE_ALERT = By.cssSelector(".pf-v5-c-alert__title");

    @Given("User is on Login page")
    public void userIsOnLoginPage() {
        if (TestConfiguration.getConnectUrl() != null) {
            Selenide.closeWindow();
            Selenide.switchTo().window(0);
            connectPage.connectTo("test-connection");
        } else {
            LoginLogout.logout();
            loginPage.loginPageIsOpened();
        }
    }

    @When("the user attempts to log in with incorrect credentials {int} times")
    public void theUserAttemptsToLogInWithIncorrectCredentialsTimes(int attempts) {
        BiConsumer<String, String> loginAct = TestConfiguration.getConnectUrl() != null
            ? ConnectPage::login
            : loginPage::login;

        for (int i = 0; i < attempts; i++) {
            loginAct.accept("user", "invalid");
        }
    }

    @Then("the user should see a message indicating account lockout for {int} second(s)")
    public void theUserShouldSeeAMessageIndicatingAccountLockoutForIntSeconds(int seconds) {
        if (TestConfiguration.getConnectUrl() != null) {
            $(CONNECT_PAGE_ALERT).shouldHave(text("Login attempt blocked. Retry after " + seconds));
        } else {
            $(WARNING).shouldHave(text("Login attempt blocked. Retry after " + seconds));
        }
    }

}

