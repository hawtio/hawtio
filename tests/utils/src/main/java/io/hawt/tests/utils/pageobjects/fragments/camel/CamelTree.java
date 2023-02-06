package io.hawt.tests.utils.pageobjects.fragments.camel;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.Selenide.page;

import com.codeborne.selenide.ElementsCollection;

import java.util.List;

import io.hawt.tests.utils.pageobjects.pages.camel.contexts.CamelContextsPage;

/**
 * Represents the Camel tree.
 */
public class CamelTree {
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
     * Click on Collapse All button and collapse all the nodes in the tree.
     *
     * @return camel tree fragment
     */
    public CamelTree collapseAll() {
        $("i[title='Collapse All']").click();
        return this;
    }

    /**
     * Expands context with a given name.
     *
     * @param context name of a context to expand
     */
    private void expandContext(String context) {
        $(byXpath("//li[text() = '" + context + "']")).shouldBe(visible).click();
    }

    /**
     * Expands folder with a given name nested under a specified context.
     *
     * @param context name of a context to expand
     * @param folder  name of a folder to expand
     */
    private void expand(String context, String folder) {
        $(byXpath("//li[contains(@id, '" + context + "')]")).shouldBe(visible).click();
        $(byXpath("//li[contains(@id, '" + context + "-" + folder + "')]")).shouldBe(visible).click();
    }

    /**
     * Makes Camel Contexts (root of a tree) targeted.
     *
     * @return CamelContextsPage class
     */
    public CamelContextsPage targetCamelContextsRoot() {
        $(byXpath("//li[contains(@id, \"camelContexts\")]")).click();
        return page(CamelContextsPage.class);
    }

    /**
     * Get all nodes in the tree, no matter if they are hidden or visible.
     *
     * @return all nodes
     */
    public ElementsCollection getAllNodesInTree() {
        return $$(byXpath("//div[@id='cameltree']/ul/li"));
    }

    /**
     * Return all available routes under specified context.
     *
     * @param context name of a context
     * @return list of a names (string)
     */
    public List<String> getRoutes(String context) {
        expandContext(context);
        expand(context, "routes");
        return $$(byXpath("//li[@class=\"list-group-item node-cameltree org-apache-camel-routes can-invoke\"]"))
            .shouldHave(sizeGreaterThan(0))
            .texts();
    }

    /**
     * Return all available components under specified context.
     *
     * @param context name of a context
     * @return list of names (string)
     */
    public List<String> getComponents(String context) {
        expandContext(context);
        expand(context, "components");
        return $$(byXpath("//li[@class=\"list-group-item node-cameltree org-apache-camel-components can-invoke\"]"))
            .shouldHave(sizeGreaterThan(0))
            .texts();
    }

    /**
     * Return all available endpoints under specified context.
     *
     * @param context name of a context
     * @return list of names (string)
     */
    public List<String> getEndpoints(String context) {
        expandContext(context);
        expand(context, "endpoints");
        return $$(byXpath("//li[@class=\"list-group-item node-cameltree org-apache-camel-endpoints can-invoke\"]"))
            .shouldHave(sizeGreaterThan(0))
            .texts();
    }

    /**
     * Return all available dataformats under specified context.
     *
     * @param context name of a context
     * @return list of names (string)
     */
    public List<String> getDataformats(String context) {
        expandContext(context);
        expand(context, "dataformats");
        return $$(byXpath("//li[@class=\"list-group-item node-cameltree org-apache-camel-dataformats can-invoke\"]"))
            .shouldHave(sizeGreaterThan(0))
            .texts();
    }

    /**
     * Check that the context is situated in the camel tree.
     *
     * @return camel tree fragment
     */
    public CamelTree isContextInCamelTree(String context) {
        $(byXpath(".//li[contains(@id, '" + context + "')]")).is(visible);
        return this;
    }
}
