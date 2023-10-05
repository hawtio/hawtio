package io.hawt.tests.features.hooks;

import com.codeborne.selenide.Selenide;

import io.cucumber.java.Before;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.setup.LoginLogout;
import io.hawt.tests.features.setup.WebDriver;

public class LoginLogoutHooks {

    private static boolean init = false;

    @Before
    public static void before() {
        if (!init) {
            WebDriver.setup();
            LoginLogout.login(TestConfiguration.getAppUsername(), TestConfiguration.getAppPassword());
            init = true;
        } else {
            if (Selenide.webdriver().driver().getWebDriver().getCurrentUrl().contains("login")) {
                LoginLogout.login(TestConfiguration.getAppUsername(), TestConfiguration.getAppPassword());
            } else {
                Selenide.open(DeployAppHook.getBaseURL() + TestConfiguration.getUrlSuffix() + "/jmx");
            }
        }
        LoginLogout.hawtioIsLoaded();
    }
}
