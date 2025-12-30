package io.hawt.tests.features.pageobjects.fragments.camel.tabs.endpoints;

import static com.codeborne.selenide.Condition.clickable;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byAttribute;
import static com.codeborne.selenide.Selectors.byTagAndText;
import static com.codeborne.selenide.Selectors.byTagName;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;

import com.codeborne.selenide.SelenideElement;

/**
 * Represents Browse Tab page in Camel Endpoints.
 */
public class CamelBrowse extends CamelPage {
    private static final SelenideElement FORWARD_MESSAGE_MODAL_SELECTOR = $(byAttribute("aria-label", "forward-message-modal"));

    /**
     * Checks that the message is visible in the list.
     *
     * @param message to be checked
     */
    public void browseMessage(String message) {
        $(byTagAndText("td", message)).shouldBe(visible);
    }

    /**
     * Select the message from the list.
     *
     * @param message to be selected
     */
    public void selectMessage(String message) {
        $(byXpath("//td[text()='" + message + "']/preceding-sibling::td//input")).shouldBe(enabled).click();
    }

    /**
     * Forward the selected message.
     *
     * @param endpointURI where the message is forwared
     */
    public void forwardSelectedMessage(String endpointURI) {
        clickButton("Forward");
        FORWARD_MESSAGE_MODAL_SELECTOR.$(byAttribute("aria-label", "Search input")).shouldBe(enabled).click();
        $(byTagAndText("p", endpointURI)).shouldBe(visible).click();
        FORWARD_MESSAGE_MODAL_SELECTOR.$(byTagAndText("span", "Forward")).shouldBe(clickable).click();
        successfulAlertMessage().closeAlertMessage();
        $(byAttribute("aria-label", "Close")).shouldBe(clickable).click();
    }

    /**
     * Click on the message to open its details.
     *
     * @param message details to be shown
     */
    public void clickOnMessage(String message) {
        $(byXpath("//td[text()='" + message + "']/preceding-sibling::td//button")).shouldBe(enabled).click();
    }

    /**
     * Check that the message details are shown.
     *
     * @param message to be checked
     */
    public void detailsAreDisplayed(String message) {
        $(byTagName("pre")).shouldHave(exactText(message));
    }
}
