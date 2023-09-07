package io.hawt.tests.features.pageobjects.fragments.camel;

import static com.codeborne.selenide.CollectionCondition.allMatch;
import static com.codeborne.selenide.CollectionCondition.size;
import static com.codeborne.selenide.Condition.cssClass;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.hidden;
import static com.codeborne.selenide.Condition.interactable;
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

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

/**
 * Represents Camel Tree in Camel.
 */
public class CamelTree {
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
        $("[id*='" + itemPartialId + "']").$("[class$='node-text']").shouldBe(interactable).click();
    }

    /**
     * Select a given item by full ID value.
     *
     * @param fullId of the item to be selected.
     */
    public void selectSpecificItemByExactId(String fullId) {
        $(byId(fullId)).$("[class$='node-text']").shouldBe(interactable).click();
    }

    /**
     * Expand Camel tree.
     */
    public void expandCamelTree() {
        if (!$(byTagName("li")).has(cssClass("expanded"))) {
            // if Camel tree is not expanded - expand it
            toggleExpandCollapseCamelTree();
        }
    }

    /**
     * Collapse Camel tree.
     */
    public void collapseCamelTree() {
        if ($(byTagName("li")).has(cssClass("expanded"))) {
            // if Camel tree is expanded - collapse it
            toggleExpandCollapseCamelTree();
        } else {
            // when the Camel tab is reached again, the Camel tree is usually collapsed again
            // it is needed to expand it first and then collapse it for the testing purpose
            toggleExpandCollapseCamelTree();
            toggleExpandCollapseCamelTree();
        }
    }

    /**
     * Expand and collapse Camel tree.
     */
    private void toggleExpandCollapseCamelTree() {
        // there is only one button responsible for expanding and collapsing, it works as toggle button
        expandCollapseBtn.shouldBe(enabled).click();
    }

    /**
     * Check that Camel tree nodes are expanded/collapsed correctly according to their state.
     *
     * @param state of the Camel tree nodes
     */
    public void allCamelTreeNodesState(String state) {
        if (state.contains("expanded")) {
            // when Camel tree is expanded, all list items should contain expanded class
            camelTreeNodes.should(allMatch("Each node is expanded", e -> e.getAttribute("class").contains(state)));
        } else if (state.contains("hidden")) {
            // when Camel tree is collapsed, then the only one list item is displayed - Camel Context item
            camelTreeNodes.shouldHave(size(1));
            $(byClassName("expanded")).shouldBe(hidden);
        }
    }

    /**
     * Set a value to filter Camel tree.
     *
     * @param value to filter the Camel tree
     */
    public void filterCamelTree(String value) {
        $(byId("input-search")).shouldBe(enabled).setValue(value);
    }

    /**
     * Check that Camel tree is filtered.
     *
     * @param value by which the Camel tree is filtered
     */
    public void camelTreeIsFiltered(String value) {
        $(byTagAndText("button", value)).should(exist).shouldBe(visible);
    }
}
