package io.hawt.tests.features.pageobjects.pages.openshift;

import static com.codeborne.selenide.Selenide.$;

import org.assertj.core.api.Assertions;
import org.openqa.selenium.By;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;
import com.codeborne.selenide.ex.ElementNotFound;

import java.time.Duration;

import io.hawt.tests.features.openshift.WaitUtils;
import io.hawt.tests.features.utils.ByUtils;

public class HawtioOnlineLoginPage {

    private static final Logger LOG = LoggerFactory.getLogger(HawtioOnlineLoginPage.class);

    public void login(String username, String password) {
        WaitUtils.waitForPageLoad();

        final By appUnavailableSelector = ByUtils.byExactText("h1", "Application is not available");
        if ($(appUnavailableSelector).exists()) {
            LOG.info("Application is not available, let's wait and reload :)");
            WaitUtils.wait(Duration.ofSeconds(10));
            Selenide.refresh();
            WaitUtils.waitForPageLoad();
            if ($(appUnavailableSelector).exists()) {
                Assertions.assertThat($(appUnavailableSelector).exists()).withFailMessage(() -> "App wasn't available in time :(").isFalse();
            }
        }

        final By loginButtonSelector = By.cssSelector("a[title=\"Log in with my_htpasswd_provider\"]");

        try {
            $(loginButtonSelector).should(Condition.appear, Duration.ofSeconds(10));
        } catch (ElementNotFound e) {
            return;
        }

        $(loginButtonSelector).click();
        $(By.id("inputUsername")).sendKeys(username);
        $(By.id("inputPassword")).sendKeys(password);
        final String prevUrl = WebDriverRunner.url();
        $(By.cssSelector("button.pf-m-primary[type=\"submit\"]")).click();

        WaitUtils.waitFor(() -> !prevUrl.equals(WebDriverRunner.url()), "Waiting for browser to move from login URL", Duration.ofSeconds(15));

        if (WebDriverRunner.url().contains("approve")) {
            $(By.name("approve")).click();
            Selenide.Wait().withTimeout(Duration.ofSeconds(15)).until(driver -> !driver.getCurrentUrl().contains("login"));
        }
    }
}
