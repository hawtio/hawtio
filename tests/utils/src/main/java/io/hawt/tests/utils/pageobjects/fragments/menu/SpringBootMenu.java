package io.hawt.tests.utils.pageobjects.fragments.menu;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;

import org.openqa.selenium.By;

import io.hawt.tests.utils.pageobjects.pages.springboot.SpringBootPage;

/**
 * Represents the left-side menu with additional options for Spring Boot application.
 */
public class SpringBootMenu extends Menu {
    /**
     * Click on Spring Boot option in the menu.
     *
     * @return SpringBoot page
     */
    public SpringBootPage springBoot() {
        toggleMenuIfCollapsed();
        $(By.linkText("Spring Boot")).shouldBe(visible).click();
        return page(SpringBootPage.class);
    }
}
