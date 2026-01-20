package io.hawt.tests.features.pageobjects.fragments;

import static com.codeborne.selenide.CollectionCondition.allMatch;
import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.Condition.cssClass;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.hidden;
import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Condition.matchText;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byAttribute;
import static com.codeborne.selenide.Selectors.byClassName;
import static com.codeborne.selenide.Selectors.byId;
import static com.codeborne.selenide.Selectors.byTagAndText;
import static com.codeborne.selenide.Selectors.byTagName;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.Selenide.page;

import org.openqa.selenium.By;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

import java.time.Duration;
import java.util.List;

/**
 * Represents Tree menu in Hawtio (e.g. Camel, JMX).
 */
public class Tree {
    final SelenideElement expandCollapseBtn = $(byAttribute("aria-label", "Expand Collapse"));
    final ElementsCollection camelTreeNodes = $$(byXpath("//li[contains(@class, 'list-item')]"));

    /**
     * Expand a given folder.
     *
     * @param pageObjectClass page object class
     * @param folderPartialId partial ID value of the folder to be expanded.
     * @return the given page object class
     */
    public <P> P expandSpecificFolder(Class<P> pageObjectClass, String folderPartialId) {
        assureLoaded();
        if (!$("[id*='" + folderPartialId + "']").has(cssClass("pf-m-expanded"))) {
            $("[id*='" + folderPartialId + "']").$("[class$='node-toggle']").shouldBe(interactable).click();
        }
        return page(pageObjectClass);
    }

    /**
     * Select a given item by partial ID value.
     *
     * @param itemPartialId of the item to be selected
     */
    public void selectSpecificItem(String itemPartialId) {
        assureLoaded();
        $("[id*='" + itemPartialId + "']").$("[class$='node-text']").shouldBe(interactable).click();
    }

    /**
     * Select a given item by full ID value.
     *
     * @param fullId of the item to be selected.
     */
    public void selectSpecificItemByExactId(String fullId) {
        assureLoaded();
        $(byId(fullId)).$("[class$='node-text']").shouldBe(interactable).click();
    }

    /**
     * Expand tree.
     */
    public void expandTree() {
        if (!$(byTagName("li")).has(cssClass("expanded"))) {
            // if Camel tree is not expanded - expand it
            toggleExpandCollapseTree();
        }
    }

    /**
     * Collapse tree.
     */
    public void collapseTree() {
        if ($(byTagName("li")).has(cssClass("expanded"))) {
            // if Camel tree is expanded - collapse it
            toggleExpandCollapseTree();
        } else {
            // when the Camel tab is reached again, the Camel tree is usually collapsed again
            // it is needed to expand it first and then collapse it for the testing purpose
            toggleExpandCollapseTree();
            toggleExpandCollapseTree();
        }
    }

    /**
     * Expand and collapse tree.
     */
    private void toggleExpandCollapseTree() {
        assureLoaded();
        // there is only one button responsible for expanding and collapsing, it works as toggle button
        expandCollapseBtn.shouldBe(enabled).click();
    }

    /**
     * Check that tree nodes are expanded/collapsed correctly according to their state.
     *
     * @param state of the tree nodes
     */
    public void allTreeNodesState(String state) {
        assureLoaded();
        if (state.contains("expanded")) {
            // when the tree is expanded, all list items should contain expanded class
            camelTreeNodes.should(allMatch("Each node is expanded", e -> e.getAttribute("class").contains(state)));
        } else if (state.contains("hidden")) {
            // when the tree is not expanded, all list items should not contain expanded class
            camelTreeNodes.should(allMatch("Each node is expanded", e -> !e.getAttribute("class").contains(state)));
            $(byClassName("expanded")).shouldBe(hidden);
        }
    }

    /**
     * Set a value to filter tree.
     *
     * @param value to filter the tree
     */
    public void filterTree(String value) {
        assureLoaded();
        $(byId("input-search")).shouldBe(enabled).setValue(value);
    }

    /**
     * Check that tree is filtered.
     *
     * @param value by which the tree is filtered
     */
    public void treeIsFiltered(String value) {
        assureLoaded();
        $(byTagAndText("button", value)).should(exist).shouldBe(visible);
    }

    private void assureLoaded() {
        $(By.className("pf-v5-c-tree-view__list")).should(exist, Duration.ofSeconds(10));
    }

    /**
     * Verify if all IP addresses in the tree are currently masked with asterisks.
     * Ensures all IPs are in a consistent state (all masked OR all unmasked).
     *
     * @return true if all IPs are masked (***.***.***.**), false if all IPs show actual numbers
     * @throws AssertionError if IPs are in mixed state or not found
     */
    public boolean areAllIpAddressesMasked() {
        final String anyIpPattern = "^(\\*{3}|\\d{1,3})\\.(\\*{3}|\\d{1,3})\\.(\\*{3}|\\d{1,3})\\.(\\*{3}|\\d{1,3})-.*$";
        final String maskedIpPattern = "^\\*{3}\\.\\*{3}\\.\\*{3}\\.\\*{3}-.*$";
        final String unmaskedIpPattern = "^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}-.*$";

        // Ensure tree and IP nodes exist
        final ElementsCollection ipNodes = $$(".pf-v5-c-tree-view__node-text")
            .as("Tree nodes")
            .shouldHave(sizeGreaterThan(0))
            .filter(matchText(anyIpPattern))
            .as("IP connection nodes")
            .shouldHave(sizeGreaterThan(0));

        final List<String> ipTexts = ipNodes.texts();

        // Check for consistent state
        final boolean allMasked = ipTexts.stream().allMatch(text -> text.matches(maskedIpPattern));
        final boolean allUnmasked = ipTexts.stream().allMatch(text -> text.matches(unmaskedIpPattern));

        if (allMasked) return true;
        if (allUnmasked) return false;

        // Mixed state detected - fail with detailed error message
        throw new AssertionError(
            String.format("IP addresses are in inconsistent state. Expected all masked or all unmasked, but found mixed values: %s",
                ipTexts)
        );
    }
}
