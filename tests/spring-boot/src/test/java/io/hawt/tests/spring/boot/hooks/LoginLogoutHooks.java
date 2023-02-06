package io.hawt.tests.spring.boot.hooks;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.hawt.tests.utils.setup.LoginLogout;
import io.hawt.tests.utils.setup.WebDriver;

public class LoginLogoutHooks {

    @Before
    public void before() {
        WebDriver.setup();
        LoginLogout.login("hawtio", "hawtio");
    }

    @After
    public void after() {
        LoginLogout.logout();
        WebDriver.clear();
    }
}
