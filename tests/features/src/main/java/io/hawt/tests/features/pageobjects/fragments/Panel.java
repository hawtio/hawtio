package io.hawt.tests.features.pageobjects.fragments;

import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Condition.not;
import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.open;
import static com.codeborne.selenide.Selenide.page;
import static io.hawt.tests.features.setup.LoginLogout.getUrlFromParameters;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.hawt.tests.features.pageobjects.pages.LoginPage;

/**
 * Represents the panel which contains About, Help, Logout, etc. actions.
 */
public class Panel {
    private static final Logger LOG = LoggerFactory.getLogger(Panel.class);

    /**
     * Logout from Hawtio.
     *
     * @return Login page
     */
    public LoginPage logout() {
        // Check if already logged out
        if (!$(byXpath("//a[contains(text(),'my_htpasswd_provider')]")).is(interactable)) {
            this.openDropDownMenu("#hawtio-header-user-dropdown-toggle");
            // Workaround for Windows machines - sometimes, the Logout button is not loaded properly
            if ($(byXpath("//a[contains(text(), 'Log out')]")).is(not(interactable))) {
                LOG.info("Logout by the direct logout URL");
                open(getUrlFromParameters() + "/auth/logout");
            } else {
                LOG.info("Logout from the drop-down menu list");
                $(byXpath("//a[contains(text(), 'Log out')]")).shouldBe(interactable).click();
            }
        }
        return page(LoginPage.class);
    }

    /**
     * Open desired menu item from the drop-down menu under the question mark.
     */
    public void openMenuItemUnderQuestionMarkDropDownMenu(String option) {
        this.openDropDownMenu("#hawtio-header-toolbar [id^=pf-dropdown-toggle-id-]");
        $(byLinkText(option)).shouldBe(interactable).click();
    }

    /**
     * Open a drop-down menu by css selector value.
     */
    private void openDropDownMenu(String selector) {
        $(selector).shouldBe(interactable).click();
    }
}
