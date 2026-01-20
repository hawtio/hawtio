package io.hawt.tests.features.pageobjects.fragments.menu;

import static com.codeborne.selenide.Condition.attribute;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.focused;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Condition.not;
import static com.codeborne.selenide.Selectors.byClassName;
import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;

import java.time.Duration;

import io.hawt.tests.features.utils.ByUtils;

/**
 * Represent a left-side menu.
 */
public class Menu {
    private final SelenideElement toggleBtn = $("#vertical-nav-toggle");
    private final SelenideElement camelTreeView = $("#camel-tree-view");

    /**
     * Click on a given nav item from the left-side bar.
     */
    public void navigateTo(String navItem) {
        final SelenideElement item = $(byLinkText(navItem));
        final SelenideElement emptyStateContent = $(ByUtils.byLabel("Loading Hawtio"));

        toggleLeftSideBarIfCollapsed();


        // Sometimes Selenide is faster than Hawtio and content is loaded properly
        emptyStateContent.shouldNot(exist, Duration.ofSeconds(10));

        // Wait for the navigation item to be available before clicking
        item.should(exist).shouldBe(interactable);
        item.click();
        toggleLeftSideBarIfOverlaysCamelTree();
    }

    /**
     * Toggle a left-side bar if it overlays a Camel tree view.
     */
    private void toggleLeftSideBarIfOverlaysCamelTree() {
        if (toggleBtn.has(attribute("aria-expanded", "true")) && camelTreeView.is(not(focused))) {
            toggleLeftSideBar();
        }
    }

    /**
     * Toggle a left-side bar if it is collapsed.
     */
    private void toggleLeftSideBarIfCollapsed() {
        if (toggleBtn.has(attribute("aria-expanded", "false"))) {
            toggleLeftSideBar();
        }
    }

    /**
     * Toggle left sidebar.
     */
    public void toggleLeftSideBar() {
        toggleBtn.shouldBe(interactable).click();
    }
}
