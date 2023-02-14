package io.hawt.tests.utils.pageobjects.fragments.camel;

import static com.codeborne.selenide.CollectionCondition.allMatch;
import static com.codeborne.selenide.CollectionCondition.empty;
import static com.codeborne.selenide.CollectionCondition.itemWithText;
import static com.codeborne.selenide.CollectionCondition.size;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.Selenide.page;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.ElementsCollection;

/**
 * Represents the Camel tree.
 */
public class CamelTree {
    private static final Logger LOG = LoggerFactory.getLogger(CamelTree.class);

    /**
     * Expand specific Camel Context in a Camel tree.
     *
     * @param pageObjectClass
     * @param context         name of a context containing a node
     * @return page of a given class
     */
    public <P> P expandSpecificContext(Class<P> pageObjectClass, String context) {
        $(byXpath("//li[contains(@id, 'context-" + context + "')]")).shouldBe(visible).click();
        return page(pageObjectClass);
    }

    /**
     * Expand a folder nested under specified context in Camel tree.
     *
     * @param pageObjectClass
     * @param folder          name of a folder to expand
     * @return page of a given class
     */
    public <P> P expandSpecificFolder(Class<P> pageObjectClass, String folder) {
        $(byXpath("//li[contains(@class, '" + folder + "-folder')]")).shouldBe(visible).click();
        return page(pageObjectClass);
    }

    /**
     * Select specific node in Camel tree.
     *
     * @param pageObjectClass
     * @param node            name of a node to be selected
     * @param folder          name of a folder containing a node
     * @param context         name of a context containing a node
     * @return the page of a given class
     */
    public <P> P selectSpecificNode(Class<P> pageObjectClass, String node, String folder, String context) {
        $(byXpath("//li[contains(@id, '" + context + "-" + folder + "-" + node + "')]")).shouldBe(visible).click();
        return page(pageObjectClass);
    }

    /**
     * Click on Expand All button and expand all the nodes in the tree.
     *
     * @return camel tree fragment
     */
    public CamelTree expandAll() {
        $("i[title='Expand All']").shouldBe(visible).click();
        return this;
    }

    /**
     * Check that all nodes are visible after clicking on expand all button.
     *
     * @return camel tree fragment
     */
    public CamelTree allNodesAreVisible() {
        hiddenNodes().shouldBe(empty);
        return this;
    }

    /**
     * Click on Collapse All button and collapse all the nodes in the tree.
     *
     * @return camel tree fragment
     */
    public CamelTree collapseAll() {
        $("i[title='Collapse All']").click();
        return this;
    }

    /**
     * Check that all nodes are hidden after clicking on collapse all button.
     *
     * @return camel tree fragment
     */
    public CamelTree allNodesAreHidden() {
        hiddenNodes().shouldHave(size(allNodesInTree().size() - 1));
        return this;
    }

    /**
     * Get all nodes that are hidden (not expanded).
     *
     * @return all hidden nodes
     */
    public ElementsCollection hiddenNodes() {
        return $(byXpath(".//div[@id='cameltree']")).$$(byXpath(".//li[contains(@class, 'node-hidden')]"));
    }

    /**
     * Get all nodes in the tree, no matter if they are hidden or visible.
     *
     * @return all nodes
     */
    public ElementsCollection allNodesInTree() {
        return $$(byXpath("//div[@id='cameltree']/ul/li"));
    }

    /**
     * Check that context is situated in the camel tree.
     *
     * @return camel tree fragment
     */
    public CamelTree contextIsInCamelTree(String context) {
        $(byXpath(".//li[contains(@id, '" + context + "')]")).is(visible);
        return this;
    }

    /**
     * Set the value for filtering to the filter input.
     *
     * @return camel tree fragment
     */
    public CamelTree setFilterValue(String value) {
        $(byXpath(".//input[@id='input-search']")).shouldBe(enabled).setValue(value);
        return this;
    }

    /**
     * Check that tree was filtered correctly.
     *
     * @return camel tree fragment
     */
    public CamelTree checkTreeFiltering(String filteredValue) {
        filteredMarkedNodes().shouldBe(itemWithText(filteredValue));
        filteredNodesByValue(filteredValue).shouldBe(allMatch("elements contain node-result class", el -> el.getAttribute("class").contains("node-result")));
        return this;
    }

    /**
     * Get all filtered nodes (they are marked with orange color).
     *
     * @return filtered nodes
     */
    public ElementsCollection filteredMarkedNodes() {
        return $$(byXpath(".//li[contains(@class, 'node-result')]"));
    }

    /**
     * Get all nodes filtered by value.
     *
     * @param value which filter nodes
     * @return nodes filtered by value
     */
    public ElementsCollection filteredNodesByValue(String value) {
        return $$(byXpath(".//li[contains(text(), '" + value + "')]"));
    }

    /**
     * Check that count of filter results is the same that actual count of filtered nodes.
     *
     * @return camel tree fragment
     */
    public CamelTree checkCountOfFilterResult(String value) {
        final int filterCount = Integer.parseInt($(byXpath(".//span[@class = 'badge ng-binding positive']")).getText());
        filteredMarkedNodes().shouldHave(size(filterCount));
        filteredNodesByValue(value).shouldHave(size(filterCount));
        return this;
    }
}
