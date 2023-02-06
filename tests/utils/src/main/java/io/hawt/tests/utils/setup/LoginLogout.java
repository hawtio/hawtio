package io.hawt.tests.utils.setup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Selenide;

import io.hawt.tests.utils.pageobjects.fragments.Panel;
import io.hawt.tests.utils.pageobjects.pages.LoginPage;

public class LoginLogout {
    private static final Panel panel = new Panel();
    private static final Logger LOG = LoggerFactory.getLogger(LoginLogout.class);

    private LoginLogout() {
    }

    public static void login(String username, String password) {
        LOG.info("Opening and logging in on " + getUrlFromParameters());
        Selenide.open(getUrlFromParameters(), LoginPage.class).loginPageIsOpened().login(username, password);
    }

    public static void logout() {
        LOG.info("Logging out from Hawtio");
        panel.logout().loginPageIsOpened();
    }

    public static String getUrlFromParameters() {
        return "http://localhost:" + System.getProperty("hawtio.managementPort") + System.getProperty("hawtio.url");
    }
}
