package io.hawt.tests.features.pageobjects.fragments.camel.tabs.endpoints;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byAttribute;
import static com.codeborne.selenide.Selectors.byTagAndText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.actions;
import io.hawt.tests.features.pageobjects.pages.camel.CamelPage;


/**
 * Represents Send Tab page in Camel Endpoints.
 */
public class CamelSend extends CamelPage {

    /**
     * Add one header to the message.
     *
     * @param header      name to be added
     * @param headerValue to be added
     */
    public void addOneHeader(String header, String headerValue) {
        clickButton("Add Headers");
        $(byAttribute("aria-label", "Search input")).shouldBe(enabled).click();
        $(byTagAndText("p", header)).shouldBe(visible).click();
        $(byAttribute("name", "value")).shouldBe(enabled).setValue(headerValue);
    }

    /**
     * Add the message body and select its format.
     *
     * @param message body content
     */
    public void addMessageBody(String message) {
        // .sendKeys() work directly only with interactable inputs and textareas
        $("div.view-line").click();
        actions().moveToElement($("div.view-line span span")).sendKeys(message).perform();
    }

    /**
     * Set the message type.
     *
     * @param messageType whether plaintext, xml or json
     */
    public void setMessageType(String messageType) {
        $(byAttribute("aria-label", "options-menu")).shouldBe(enabled).click();
        $(byTagAndText("span", messageType)).parent().shouldBe(visible).click();
        clickButton("Format");
    }

    /**
     * Send the message.
     */
    public void sendMessage() {
        clickButton("Send");
    }
}
