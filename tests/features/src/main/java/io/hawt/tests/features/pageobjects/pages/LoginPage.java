package io.hawt.tests.features.pageobjects.pages;

import static com.codeborne.selenide.Condition.editable;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.SelenideElement;

/**
 * Represents a Login page.
 */
public class LoginPage {
    private final static SelenideElement loginDiv = $("div.pf-c-login");
    private final static SelenideElement loginInput = $("#pf-login-username-id");
    private final static SelenideElement passwordInput = $("#pf-login-password-id");
    private final static SelenideElement loginButton = $("button[type='submit']");

    /**
     * Login to hawtio as given user with given password.
     */
    public void login(String username, String password) {
        loginDiv.shouldBe(visible).should(exist);
        loginInput.shouldBe(editable).setValue(username);
        passwordInput.shouldBe(editable).setValue(password);
        loginButton.shouldBe(enabled).click();
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
