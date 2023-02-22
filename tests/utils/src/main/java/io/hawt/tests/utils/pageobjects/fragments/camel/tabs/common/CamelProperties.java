package io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$$;

import com.codeborne.selenide.ElementsCollection;

import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Camel Properties tab
 */
public class CamelProperties extends HawtioPage {
    /**
     * Check that table with Defined properties is not empty.
     *
     * @return CamelProperties
     */
    public CamelProperties checkDefinedPropertyAttributes() {
        getDefinedPropAttributes().shouldHave(sizeGreaterThanOrEqual(1));
        return this;
    }

    /**
     * Check that table with Default properties is not empty.
     *
     * @return CamelProperties
     */
    public CamelProperties checkDefaultPropertyAttributes() {
        getDefaultPropAttributes().shouldHave(sizeGreaterThanOrEqual(1));
        return this;
    }

    /**
     * Get default property attributes.
     *
     * @return elements collection of default property attributes
     */
    public ElementsCollection getDefaultPropAttributes() {
        return getAttributes("Default Properties");
    }

    /**
     * Check that table with Undefined properties is not empty.
     *
     * @return CamelProperties
     */
    public CamelProperties checkUndefinedPropertyAttributes() {
        getUndefinedPropAttributes().shouldHave(sizeGreaterThanOrEqual(1));
        return this;
    }

    /**
     * Get undefined property attributes.
     *
     * @return elements collection of undefined property attributes
     */
    public ElementsCollection getUndefinedPropAttributes() {
        return getAttributes("Undefined Properties");
    }

    /**
     * Get defined attribute properties.
     *
     * @return collection of attributes
     */
    public ElementsCollection getDefinedPropAttributes() {
        return getAttributes("Defined Properties");
    }

    /**
     * Get attributes.
     *
     * @param type of attributes
     * @return collection of attributes
     */
    public ElementsCollection getAttributes(String type) {
        return $$(byXpath("//property-list[@title=\"" + type + "\"]//dt"));
    }
}
