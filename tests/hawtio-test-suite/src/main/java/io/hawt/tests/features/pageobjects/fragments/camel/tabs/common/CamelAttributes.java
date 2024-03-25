package io.hawt.tests.features.pageobjects.fragments.camel.tabs.common;

import static com.codeborne.selenide.Condition.visible;

import org.openqa.selenium.By;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.hawt.tests.features.pageobjects.fragments.Table;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

/**
 * Represents Attributes Tab page in Camel.
 */
public class CamelAttributes extends CamelPage {
    private static final Table table = new Table();

    private static final Logger LOG = LoggerFactory.getLogger(CamelAttributes.class);

    /**
     * Expand details of specified attribute by attribute name.
     *
     * @param attributeName of details to be expanded
     */
    public void expandAttributeDetailsByAttributeName(String attributeName) {
        LOG.info("Using TD for clicking!");
        table.getRowByValue(attributeName).find(By.tagName("td")).shouldBe(visible).click();
    }
}
