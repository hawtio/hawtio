package io.hawt.tests.features.pageobjects.pages.openshift;

import static com.codeborne.selenide.Selenide.$;

import org.openqa.selenium.By;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;
import com.codeborne.selenide.ex.ElementNotFound;

import java.time.Duration;

import io.hawt.tests.features.openshift.WaitUtils;

public class HawtioOnlineLoginPage {

    public void login(String username, String password) {
        WaitUtils.waitForPageLoad();
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
