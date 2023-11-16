package io.hawt.tests.features.pageobjects.pages.openshift;

import static com.codeborne.selenide.Selenide.$;

import org.apache.commons.lang3.StringUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;

import java.time.Duration;

import io.hawt.tests.features.pageobjects.fragments.menu.ConnectTab;
import io.hawt.tests.features.pageobjects.fragments.menu.Menu;
import io.hawt.tests.features.pageobjects.fragments.online.DiscoverTab;
import io.hawt.tests.features.utils.ByUtils;

public class HawtioOnlinePage {

    private static void ensureToggled(String name) {
        if (!Selenide.webdriver().driver().url().endsWith(name.toLowerCase())) {
            new Menu().navigateTo(StringUtils.capitalize(name));
        }
    }

    public SelenideElement getDropdownMenu() {
        $(By.id("online-header-toolbar-dropdown-toggle")).click();
        return $(By.className("online-header-toolbar-dropdown")).$(ByUtils.byAttribute("ul", "role", "menu")).should(
            Condition.appear, Duration.ofSeconds(5));
    }

    public void clickConsoleLink() {
        getDropdownMenu().$(By.className("console-link")).click();
    }

    public DiscoverTab getDiscoverTab() {
        ensureToggled("discover");
        return new DiscoverTab();
    }

    public ConnectTab getConnectTab() {
        ensureToggled("connect");
        return new ConnectTab();
    }

}
