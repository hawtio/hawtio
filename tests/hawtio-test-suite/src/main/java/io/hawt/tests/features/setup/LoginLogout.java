package io.hawt.tests.features.setup;

import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;

import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.hooks.DeployAppHook;
import io.hawt.tests.features.pageobjects.fragments.Panel;
import io.hawt.tests.features.pageobjects.pages.ConnectPage;
import io.hawt.tests.features.pageobjects.pages.LoginPage;

public class LoginLogout {
    private static final Panel panel = new Panel();
    private static final Logger LOG = LoggerFactory.getLogger(LoginLogout.class);

    private LoginLogout() {
    }

    /**
     * Do a log in Hawtio.
     *
     * @param username to be used.
     * @param password to be used.
     */
    public static void login(String username, String password) {
        final String connectionName = "test-connection";
        LOG.info("Opening and logging in on " + DeployAppHook.getBaseURL());
        Selenide.open(DeployAppHook.getBaseURL() + TestConfiguration.getUrlSuffix() + "/connect", LoginPage.class).login(username, password);

        if (TestConfiguration.getConnectUrl() != null) {
            var connectPage = new ConnectPage();
            connectPage.addConnection(connectionName, TestConfiguration.getConnectUrl());
            connectPage.connectTo(connectionName);
        }
    }

    /**
     * Log out from Hawtio.
     */
    public static void logout() {
        LOG.info("Logging out from Hawtio");
        panel.logout().loginPageIsOpened();
    }

    /**
     * Get a URL of Hawtio from the parameters.
     *
     * @return the URL of a running Hawtio instance
     */
    public static String getUrlFromParameters() {
        return "http://localhost:" + System.getProperty("hawtio.managementPort") + System.getProperty("hawtio.url");
    }

    /**
     * Check that Hawtio page is properly and fully loaded.
     */
    public static void hawtioIsLoaded() {
        $("img.pf-c-brand").should(exist).shouldBe(interactable);
        $("#vertical-nav-toggle").should(exist).shouldBe(interactable);
    }
}
