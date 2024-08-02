package io.hawt.tests.features.pageobjects.fragments;

import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Condition.not;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.open;
import static com.codeborne.selenide.Selenide.page;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.hawt.tests.features.hooks.DeployAppHook;
import io.hawt.tests.features.pageobjects.pages.LoginPage;
import io.hawt.tests.features.utils.ByUtils;

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
            if ($(ByUtils.byText("Log out")).is(not(interactable))) {
                LOG.info("Logout by the direct logout URL");
                open(DeployAppHook.getBaseURL() + "/auth/logout");
            } else {
                LOG.info("Logout from the drop-down menu list");
                $(ByUtils.byText("Log out")).shouldBe(interactable).click();
            }
        }
        return page(LoginPage.class);
    }

    /**
     * Open desired menu item from the drop-down menu under the question mark.
     */
    public void openMenuItemUnderQuestionMarkDropDownMenu(String option) {
        this.openDropDownMenu(".pf-v5-c-toolbar__group:nth-of-type(2)");
        $(byText(option)).shouldBe(interactable).click();
    }

    /**
     * Open a drop-down menu by css selector value.
     */
    private void openDropDownMenu(String selector) {
        $(selector).shouldBe(interactable).click();
    }
}
