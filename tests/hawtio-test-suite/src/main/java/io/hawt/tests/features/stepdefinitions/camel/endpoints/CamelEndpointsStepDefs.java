package io.hawt.tests.features.stepdefinitions.camel.endpoints;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.endpoints.CamelBrowse;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.endpoints.CamelEndpoints;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.endpoints.CamelSend;

public class CamelEndpointsStepDefs {
    private final CamelBrowse camelBrowse = new CamelBrowse();
    private final CamelEndpoints camelEndpoints = new CamelEndpoints();
    private final CamelSend camelSend = new CamelSend();

    @When("^User adds Endpoint \"([^\"]*)\" from URI$")
    public void userAddsEndpointFromUri(String endpointUri) {
        camelEndpoints.add()
            .fromUri(endpointUri);
    }

    @When("^User adds Endpoint \"([^\"]*)\" name and \"([^\"]*)\" component from Data$")
    public void userAddsEndpointFromData(String endpoint, String component) {
        camelEndpoints.add()
            .fromData(endpoint, component);
    }

    @When("^User sets \"([^\"]*)\" header with value of \"([^\"]*)\"$")
    public void userSetsHeaderWithValueOf(String header, String headerValue) {
        camelSend.addOneHeader(header, headerValue);
    }

    @When("^User adds \"([^\"]*)\" message body$")
    public void userSetsMessageAs(String message) {
        camelSend.addMessageBody(message);
    }

    @When("^User sets \"([^\"]*)\" message type$")
    public void userSetsMessageType(String messageType) {
        camelSend.setMessageType(messageType);
    }

    @When("^User sends the message$")
    public void userSendsMessageAs() {
        camelSend.sendMessage();
    }

    @Then("^User can browse the message with \"([^\"]*)\" body$")
    public void userCanBrowseMessageWithBody(String message) {
        camelBrowse.browseMessage(message);
    }

    @When("^User selects the message with \"([^\"]*)\" body$")
    public void userSelectsMessage(String message) {
        camelBrowse.selectMessage(message);
    }

    @And("^User forwards the message to \"([^\"]*)\" URI$")
    public void userForwardsMessageTo(String endpointURI) {
        camelBrowse.forwardSelectedMessage(endpointURI);
    }

    @When("^User clicks on the message with \"([^\"]*)\" body$")
    public void userClicksOnMessageWithBody(String message) {
        camelBrowse.clickOnMessage(message);
    }

    @Then("^Details of the message with \"([^\"]*)\" body are displayed$")
    public void detailsOfTheMessageWithBodAreDisplayed(String message) {
        camelBrowse.detailsAreDisplayed(message);
    }
}
