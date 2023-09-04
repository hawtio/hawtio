package io.hawt.tests.features.pageobjects.fragments.camel.tabs.endpoints;

import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byAttribute;
import static com.codeborne.selenide.Selectors.byTagAndText;
import static com.codeborne.selenide.Selectors.byXpath;
import static com.codeborne.selenide.Selenide.$;
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
        $(byTagAndText("button", "Add Headers")).shouldBe(enabled).click();
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
        $(byXpath("//textarea")).sendKeys(message);
    }

    /**
     * Set the message type.
     *
     * @param messageType whether plaintext, xml or json
     */
    public void setMessageType(String messageType) {
        $(byAttribute("aria-label", "Options menu")).shouldBe(enabled).click();
        $(byTagAndText("button", messageType)).shouldBe(visible).click();
        clickButton("Format");
    }

    /**
     * Send the message.
     */
    public void sendMessage() {
        clickButton("Send");
    }
}
