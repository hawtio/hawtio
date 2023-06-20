package io.hawt.tests.features.hooks;

import org.apache.commons.lang3.RandomUtils;
import org.apache.commons.lang3.StringUtils;
import org.assertj.core.api.Assertions;
import org.openqa.selenium.logging.LogType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Selenide;

import java.util.List;

import io.cucumber.java.AfterStep;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.setup.LoginLogout;
import io.hawt.tests.features.setup.WebDriver;

public class LoginLogoutHooks {

    private static boolean init = false;

    private static final Logger LOG = LoggerFactory.getLogger(LoginLogoutHooks.class);

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
