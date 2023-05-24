package io.hawt.tests.features.hooks;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.hawt.tests.features.setup.LoginLogout;
import io.hawt.tests.features.setup.WebDriver;

public class LoginLogoutHooks {

    @Before
    public static void before() {
        WebDriver.setup();
        LoginLogout.login("hawtio", "hawtio");
        LoginLogout.hawtioIsLoaded();
    }

    @After
    public static void after() {
        LoginLogout.logout();
        WebDriver.clear();
    }
}
