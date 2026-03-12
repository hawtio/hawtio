package io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes;

import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

import static com.codeborne.selenide.CollectionCondition.sizeGreaterThan;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Selectors.byClassName;
import static com.codeborne.selenide.Selectors.byId;
import static com.codeborne.selenide.Selectors.withText;
import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

/**
 * Represents Profile Tab page in Camel.
 */
public class CamelProfile extends CamelPage {

    private static final SelenideElement PROFILE_TAB = $(byId("camel-profile-tab"));
    private static final SelenideElement PROFILE_TABLE = $("table");

    private static final ElementsCollection PROFILE_ROWS =
            PROFILE_TABLE.$$(byClassName("pf-v6-c-table__tr"));

    private static final ElementsCollection PROFILE_HEADERS =
            PROFILE_TABLE.$$("thead th");

    /**
     * Opens the Profile tab.
     */
    public void openProfileTab() {

        SelenideElement tab = PROFILE_TAB.exists()
                ? PROFILE_TAB
                : $(withText("Profile"));

        tab.shouldBe(visible).click();

        PROFILE_TABLE.shouldBe(visible);
    }

    /**
     * Checks if profile table has some data.
     */
    public void verifyProfileTableHasData() {
        PROFILE_ROWS.shouldHave(sizeGreaterThan(0));
    }

    /**
     * Verify that specific columns exist in the Profile table.
     */
    public void verifyColumns(String... expectedColumns) {

        PROFILE_HEADERS.first().shouldBe(visible);

        for (String column : expectedColumns) {
            PROFILE_HEADERS.findBy(text(column)).shouldBe(visible);
        }
    }

    /**
     * Checks if profile table is shown.
     */
    public boolean profileTableIsShown() {
        return PROFILE_TABLE.exists();
    }

    /**
     * Checks if profile tab exists.
     */
    public boolean profileTabExists() {
        return PROFILE_TAB.exists() || $(withText("Profile")).exists();
    }

    /**
     * Ensure profile table is not visible.
     */
    public void profileTableIsNotShown() {
        PROFILE_TABLE.shouldNotBe(visible);
    }
}