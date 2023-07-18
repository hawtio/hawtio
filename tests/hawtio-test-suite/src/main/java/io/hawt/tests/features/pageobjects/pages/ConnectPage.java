package io.hawt.tests.features.pageobjects.pages;

import static com.codeborne.selenide.Selenide.$;

import org.awaitility.Awaitility;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;

import java.net.URL;
import java.time.Duration;

import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.setup.LoginLogout;

public class ConnectPage extends HawtioPage {

    private static final By CONNECT_BUTTON = By.cssSelector("#connect-toolbar button");
    private static final By MODAL = By.cssSelector(".pf-c-modal-box");
    private static final By CONNECTION_FORM = By.id("connection-form");

    private static final By CONNECTION_LIST = By.id("connection-list");

    public void addConnection(String name, URL connection) {
        $(CONNECT_BUTTON).shouldBe(Condition.interactable).click();

        $(CONNECTION_FORM).$(By.id("connection-form-name")).setValue(name);
        $(CONNECTION_FORM).$(By.id("connection-form-host")).setValue(connection.getHost());
        $(CONNECTION_FORM).$(By.id("connection-form-port")).setValue(String.valueOf(connection.getPort()));
        $(CONNECTION_FORM).$(By.id("connection-form-path")).setValue(connection.getPath());

        if (!connection.getPath().endsWith("/jolokia")) {
            $(CONNECTION_FORM).$(By.id("connection-form-path")).sendKeys("/jolokia");
        }

        if ("https".equals(connection.getProtocol())) {
            $(CONNECTION_FORM).$(By.id("connection-form-scheme")).click();
        }

        $(MODAL).$(By.cssSelector("footer button.pf-m-primary")).click();
    }

    public void connectTo(String name) {
        final By connectionSelector = By.cssSelector("div[rowid=\"connection " + name + "\"]");
        final String appUrl = $(CONNECTION_LIST).$(connectionSelector).parent().$(By.className("pf-m-flex-3")).getText();

        final String username = TestConfiguration.getConnectAppUsername();
        final String password = TestConfiguration.getConnectAppPassword();

        final String prevUrl = WebDriverRunner.url();

        String url = appUrl;
        if (url.endsWith("/jolokia")) {
            url = url.replace("/jolokia", "");
        }
        if (TestConfiguration.isRunningInContainer() && url.contains("localhost")) {
            url = url.replace("localhost", "host.docker.internal");
        }

        Selenide.open(url, LoginPage.class).login(username, password);
        Awaitility.waitAtMost(Duration.ofSeconds(5)).pollInSameThread()
            .untilAsserted(() -> {
                Selenide.open(prevUrl);
                LoginLogout.hawtioIsLoaded();
            });

        $(CONNECTION_LIST).$(connectionSelector).click();
        Selenide.Wait().until(ExpectedConditions.numberOfWindowsToBe(2));
        Selenide.switchTo().window(1);
    }
}
