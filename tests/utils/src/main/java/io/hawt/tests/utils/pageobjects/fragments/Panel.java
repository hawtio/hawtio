package io.hawt.tests.utils.pageobjects.fragments;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.not;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.open;
import static com.codeborne.selenide.Selenide.page;
import static io.hawt.tests.utils.setup.LoginLogout.getUrlFromParameters;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.hawt.tests.utils.pageobjects.fragments.about.AboutModalWindow;
import io.hawt.tests.utils.pageobjects.pages.LoginPage;

public class Panel {
    private static final Logger LOG = LoggerFactory.getLogger(Panel.class);

    /**
     * Logout from hawtio.
     *
     * @return Login page
     */
    public LoginPage logout() {
        // Check if already logged out
        if (!$(byXpath("//a[contains(text(),'my_htpasswd_provider')]")).is(visible)) {
            this.openDropDownMenu("userDropdownMenu");
            // Workaround for Windows machines - sometimes, the Logout button is not loaded properly
            if ($(byXpath("//a[contains(text(), 'Logout')]")).is(not(visible))) {
                LOG.info("Logout by the direct logout URL");
                open(getUrlFromParameters() + "/auth/logout");
            } else {
                LOG.info("Logout from the drop-down menu list");
                $(byXpath("//a[contains(text(), 'Logout')]")).shouldBe(visible).click();
            }
        }
        return page(LoginPage.class);
    }

    /**
     * Open About dialog.
     *
     * @return About dialog
     */
    public AboutModalWindow about() {
        this.openDropDownMenu("helpDropdownMenu");
        $(byLinkText("About")).shouldBe(visible).click();
        return page(AboutModalWindow.class);
    }

    /**
     * Open a drop-down menu by id value.
     */
    private void openDropDownMenu(String id) {
        $(byXpath("//button[@id='" + id + "']")).shouldBe(visible).shouldBe(enabled).click();
    }
}
