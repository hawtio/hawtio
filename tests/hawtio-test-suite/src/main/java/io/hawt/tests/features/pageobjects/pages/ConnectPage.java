package io.hawt.tests.features.pageobjects.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.setup.LoginLogout;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.net.URL;

import static com.codeborne.selenide.Selenide.$;

public class ConnectPage extends HawtioPage {

    private static final By CONNECT_BUTTON = By.cssSelector("#connect-toolbar button");
    private static final By MODAL = By.cssSelector(".pf-c-modal-box");
    private static final By CONNECTION_FORM = By.id("connection-form");

    private static final By CONNECTION_LIST = By.id("connection-list");

    private static final By CONNECTION_LOGIN_FORM = By.id("connect-login-form");

    private static final By FOOTER_BUTTON = By.cssSelector("footer button.pf-m-primary");

    public void addConnection(String name, URL connection) {

    if ($(CONNECTION_LIST).isDisplayed()) {
        /* I have added if-else construct due to the reason that on re-occurring error screenshots, it seemed like the test-connection already existed.
        TO-DO: task for further examination and potential refinement */
        return;
    } else {
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

        $(MODAL).$(FOOTER_BUTTON).click();

        }
    }

    public void connectTo(String name) {
        final By connectionSelector = By.cssSelector("div[rowid=\"connection " + name + "\"]");

        final String username = TestConfiguration.getConnectAppUsername();
        final String password = TestConfiguration.getConnectAppPassword();

        $(CONNECTION_LIST).$(connectionSelector).click();

        Selenide.Wait().until(ExpectedConditions.numberOfWindowsToBe(2));
        Selenide.switchTo().window(1);

        $(CONNECTION_LOGIN_FORM).$(By.id("connect-login-form-username")).setValue(username);
        $(CONNECTION_LOGIN_FORM).$(By.id("connect-login-form-password")).setValue(password);
        $(MODAL).$(FOOTER_BUTTON).click();

    }
}
