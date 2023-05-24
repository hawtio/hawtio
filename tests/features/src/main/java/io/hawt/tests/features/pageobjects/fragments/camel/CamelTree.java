package io.hawt.tests.features.pageobjects.fragments.camel;

import static com.codeborne.selenide.Condition.interactable;
import static com.codeborne.selenide.Selectors.byId;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.page;

/**
 * Represents Camel Tree in Camel.
 */
public class CamelTree {

    /**
     * Expand a given folder.
     *
     * @param pageObjectClass page object class
     * @param folderPartialId partial ID value of the folder to be expanded.
     * @return the given page object class
     */
    public <P> P expandSpecificFolder(Class<P> pageObjectClass, String folderPartialId) {
        $("[id*='" + folderPartialId + "']").$("[class$='node-toggle']").shouldBe(interactable).click();
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

}
