package io.hawt.tests.features.pageobjects.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.ex.ConditionNotMetError;
import com.codeborne.selenide.ex.UIAssertionError;

import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.openshift.WaitUtils;
import io.hawt.tests.features.utils.ByUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.net.URL;
import java.time.Duration;

import static com.codeborne.selenide.Selenide.$;

public class ConnectPage extends HawtioPage {

    private static final By CONNECT_BUTTON = By.cssSelector("#connect-toolbar button");
    private static final By MODAL = By.cssSelector(".pf-v6-c-modal-box");
    private static final By CONNECTION_FORM = By.id("connection-form");

    private static final By CONNECTION_SCHEME = By.id("connection-form-scheme");

    private static final By CONNECTION_SCHEME_TOGGLE = By.cssSelector("span.pf-v6-c-switch__toggle");

    private static final By CONNECTION_LIST = By.id("connection-list");

    private static final By CONNECTION_LOGIN_FORM = By.id("connect-login-form");

    private static final By FOOTER_BUTTON = By.cssSelector("footer button.pf-m-primary");

    public void addConnection(String name, URL connection) {
        final String connectionSchemeHttps = "connection-form-scheme-on";

        //Don't try to create the same connection twice
        try {
            $(ByUtils.byAttribute("rowid", "connection " + name)).shouldNot(Condition.exist, Duration.ofSeconds(10));
        } catch (UIAssertionError e) {
            return;
        }

        $(CONNECT_BUTTON).shouldBe(Condition.interactable).click();

        $(CONNECTION_FORM).$(By.id("connection-form-name")).setValue(name);

        // If Scheme is HTTPS, switch to HTTP
        if (connectionSchemeHttps.equals($(CONNECTION_SCHEME).getAttribute("aria-labelledby"))) {
            $(CONNECTION_SCHEME_TOGGLE).click();
        }

        $(CONNECTION_FORM).$(By.id("connection-form-host")).setValue(connection.getHost());
        $(CONNECTION_FORM).$(By.id("connection-form-port")).setValue(String.valueOf(connection.getPort()));
        $(CONNECTION_FORM).$(By.id("connection-form-path")).setValue(connection.getPath());

        if (!connection.getPath().endsWith("/jolokia")) {
            $(CONNECTION_FORM).$(By.id("connection-form-path")).sendKeys("/jolokia");
        }

        if ("https".equals(connection.getProtocol())) {
            $(CONNECTION_FORM).$(By.id("connection-form-scheme")).click();
        }

        $(MODAL).$(FOOTER_BUTTON).click();
    }

    public void connectToAndLogin(String name) {
        final String username = TestConfiguration.getConnectAppUsername();
        final String password = TestConfiguration.getConnectAppPassword();

        connectTo(name);

        login(username, password);
    }

    public static void login(String username, String password) {
        $(CONNECTION_LOGIN_FORM).$(By.id("connect-login-form-username")).setValue(username);
        $(CONNECTION_LOGIN_FORM).$(By.id("connect-login-form-password")).setValue(password);
        $(MODAL).$(FOOTER_BUTTON).shouldBe(Condition.interactable, Duration.ofSeconds(5)).click();
    }

    public void connectTo(String name) {

        final By connectionSelector = By.cssSelector("div[rowid=\"connection " + name + "\"]");
        WaitUtils.withRetry(() -> {
            $(CONNECTION_LIST).$(connectionSelector).shouldBe(Condition.interactable, Duration.ofSeconds(5))
                .click();

            Selenide.Wait().until(ExpectedConditions.numberOfWindowsToBe(2));
            Selenide.switchTo().window(1);
        }, 5, Duration.ofSeconds(5));
    }

}
