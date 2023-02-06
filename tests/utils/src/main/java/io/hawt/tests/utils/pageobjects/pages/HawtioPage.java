package io.hawt.tests.utils.pageobjects.pages;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;

import com.codeborne.selenide.Selenide;

import io.hawt.tests.utils.pageobjects.fragments.Panel;
import io.hawt.tests.utils.pageobjects.fragments.menu.Menu;
import io.hawt.tests.utils.pageobjects.fragments.menu.SpringBootMenu;

/**
 * Represents general and common actions on Hawtio page.
 */
public class HawtioPage {
    private final Menu menu;
    private final SpringBootMenu springBootMenu;
    private final Panel panel;

    public HawtioPage() {
        menu = new Menu();
        springBootMenu = new SpringBootMenu();
        panel = new Panel();
    }

    public Menu menu() {
        return menu;
    }

    public SpringBootMenu springBootMenu() {
        return springBootMenu;
    }

    public Panel panel() {
        return panel;
    }

    /**
     * Click on button with a given name.
     *
     * @param name of button
     */
    public void clickButton(String name) {
        $(byXpath("//button[contains(text(),'" + name + "')]")).shouldBe(enabled).click();
    }

    /**
     * Refresh a page.
     *
     * @return hawtio page
     */
    public <P> P refresh(Class<P> pageObjectClass) {
        Selenide.refresh();
        return page(pageObjectClass);
    }

    public <P> P unsuccessfulAlertMessage(Class<P> pageObjectClass) {
        $(byXpath("//div[contains(@class, 'toast-pf alert alert-danger')]")).shouldBe(visible);
        return page(pageObjectClass);
    }

    public <P> P successfulAlertMessage(Class<P> pageObjectClass) {
        $(byXpath("//div[contains(@class, 'toast-pf alert alert-success')]")).shouldBe(visible);
        return page(pageObjectClass);
    }

    public <P> P alertMessage(Class<P> pageObjectClass) {
        $(byXpath("//div[contains(@class, 'toast-pf alert')]")).shouldBe(visible);
        return page(pageObjectClass);
    }

    public <P> P closeAlertMessage(Class<P> pageObjectClass) {
        $(byXpath("//div[contains(@class, 'toast-pf alert')]//button[@class='close']")).shouldBe(visible).click();
        return page(pageObjectClass);
    }
}
