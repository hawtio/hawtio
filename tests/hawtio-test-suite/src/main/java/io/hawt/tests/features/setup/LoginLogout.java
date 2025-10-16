package io.hawt.tests.features.setup;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;

import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.hooks.DeployAppHook;
import io.hawt.tests.features.openshift.OpenshiftClient;
import io.hawt.tests.features.pageobjects.fragments.Panel;
import io.hawt.tests.features.pageobjects.pages.ConnectPage;
import io.hawt.tests.features.pageobjects.pages.LoginPage;
import io.hawt.tests.features.pageobjects.pages.openshift.HawtioOnlineLoginPage;
import io.hawt.tests.features.pageobjects.pages.openshift.HawtioOnlinePage;
import io.hawt.tests.features.setup.deployment.AppDeployment;
import io.hawt.tests.features.setup.deployment.OpenshiftDeployment;

import org.openqa.selenium.By;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;

import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selenide.$;

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
        final AppDeployment deploymentMethod = TestConfiguration.getAppDeploymentMethod();
        LOG.info("Opening and logging in on " + DeployAppHook.getBaseURL());

        if (deploymentMethod instanceof OpenshiftDeployment) {
            Selenide.open(DeployAppHook.getBaseURL(), HawtioOnlineLoginPage.class)
                .login(TestConfiguration.getOpenshiftUsername(), TestConfiguration.getOpenshiftPassword());
        } else {
            if (TestConfiguration.useKeycloak()) {
                keycloakLogin("admin", "admin");
            } else if (WebDriverRunner.hasWebDriverStarted() && WebDriverRunner.url().contains("/connect/login")) {
                ConnectPage.login(TestConfiguration.getAppUsername(), TestConfiguration.getAppPassword());
            } else {
                Selenide.open(DeployAppHook.getBaseURL() + TestConfiguration.getUrlSuffix() + "/connect", LoginPage.class).login(username, password);
            }
        }

        if (TestConfiguration.getConnectUrl() != null && WebDriverRunner.url().contains("/connect/")) {
            LOG.info("Connect page URL: {}", WebDriverRunner.url());
            LOG.info("Remote Jolokia Agent URL: {}", TestConfiguration.getConnectUrl());
            var connectPage = new ConnectPage();
            connectPage.addConnection(connectionName, TestConfiguration.getConnectUrl());
            connectPage.connectToAndLogin(connectionName);
        } else if (deploymentMethod instanceof OpenshiftDeployment) {
            final String name = OpenshiftClient.get().pods().withLabel("app", "e2e-app").list().getItems().get(0).getMetadata().getName();
            new HawtioOnlinePage().getDiscoverTab().connectTo(name);
        }
    }

    private static void keycloakLogin(String username, String password) {
        Selenide.open(DeployAppHook.getBaseURL() + TestConfiguration.getUrlSuffix() + "/connect");
        Selenide.$(By.id("username")).sendKeys(username);
        Selenide.$(By.id("password")).sendKeys(password);

        Selenide.$(By.name("login")).click();
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
        $("img.pf-v5-c-brand").should(exist, Duration.ofSeconds(20)).shouldBe(interactable);
        $("#vertical-nav-toggle").should(exist).shouldBe(interactable);
    }
}
