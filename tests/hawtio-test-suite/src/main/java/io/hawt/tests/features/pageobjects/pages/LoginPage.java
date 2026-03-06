package io.hawt.tests.features.pageobjects.pages;

import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;
import com.codeborne.selenide.ex.ElementNotFound;
import org.assertj.core.api.Assertions;

import java.time.Duration;

import static com.codeborne.selenide.Condition.editable;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.$;

/**
 * Represents a Login page.
 */
public class LoginPage {
    private final static SelenideElement loginDiv = $("div.pf-v6-c-login");
    private final static SelenideElement loginInput = $("#pf-login-username-id");
    private final static SelenideElement passwordInput = $("#pf-login-password-id");
    private final static SelenideElement loginButton = $("button[type='submit']");


    /**
     * Login to hawtio as given user with given password.
     */

    public void login(String username, String password) {
        try {
            loginDiv.shouldBe(visible, Duration.ofSeconds(5)).should(exist);
            loginInput.shouldBe(editable).setValue(username);
            passwordInput.shouldBe(editable).setValue(password);
            loginButton.shouldBe(enabled).click();

        } catch (ElementNotFound e) {
            Assertions.assertThat(WebDriverRunner.url())
                .withFailMessage(() -> "Failed to login on login page: " + e)
                .doesNotContain("login");
        }
    }

    /**
     * Check whether the Login page is open and active
     */
    public void loginPageIsOpened() {
        loginInput.shouldBe(editable).should(exist);
        passwordInput.shouldBe(editable);
        loginButton.shouldBe(enabled);
    }
}
