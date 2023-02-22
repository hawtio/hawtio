package io.hawt.tests.utils.stepdefinitions.camel.endpoints;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelAttributes;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.common.CamelOperations;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints.CamelBrowse;
import io.hawt.tests.utils.pageobjects.fragments.camel.tabs.endpoints.CamelSend;
import io.hawt.tests.utils.pageobjects.pages.camel.CamelPage;
import io.hawt.tests.utils.pageobjects.pages.camel.endpoints.CamelSpecificEndpointPage;

public class CamelSpecificEndpointStepDefs {
    private static final String CAMEL_MOCK_ENDPOINT_MSG = "<?xml version = \"1.0\" encoding = \"UTF-8\"?>\\n" +
        "<OrderID Order = \"001\">\\n" +
        "   <order product = \"soaps\">\\n" +
        "      <items>\\n" +
        "         <item>\\n" +
        "            <Brand>Cinthol</Brand>\\n" +
        "            <Type>Original</Type>\\n" +
        "            <Quantity>4</Quantity>\\n" +
        "            <Price>25</Price>\\n" +
        "         </item>\\n" +
        "      </items>\\n" +
        "   </order>\\n" +
        "</OrderID>";
    private final CamelPage camelPage = new CamelPage();
    private CamelAttributes camelAttributes;
    private CamelBrowse camelBrowse;
    private CamelOperations camelOperations;
    private CamelSend camelSend;
    private CamelSpecificEndpointPage camelSpecificEndpointPage;

    @And("^User is on Camel \"([^\"]*)\" node of Endpoints folder of \"([^\"]*)\" context$")
    public void userIsOnCamelSpecificEndpointPageOfSpecificContext(String node, String context) {
        camelSpecificEndpointPage = camelPage.camelTree()
            .expandSpecificContext(CamelTree.class, context)
            .expandSpecificFolder(CamelTree.class, "endpoints")
            .selectSpecificNode(CamelSpecificEndpointPage.class, node, "endpoints", context);
    }

    @When("^User clicks on Attributes tab of Camel Specific Endpoint page$")
    public void userClicksOnAttributesTabOfCamelSpecificEndpointPage() {
        camelAttributes = camelSpecificEndpointPage.attributes();
    }

    @When("^User clicks on Operations tab of Camel Specific Endpoint page$")
    public void userClicksOnOperationsTabOfCamelSpecificComponentPage() {
        camelOperations = camelSpecificEndpointPage.operations();
    }

    @When("^User clicks on Send tab of Camel Specific Endpoint page$")
    public void userClicksOnSendTabOfCamelSpecificComponentPage() {
        camelSend = camelSpecificEndpointPage.send();
    }

    @Then("^User clicks on Browse tab of Camel Specific Endpoint page$")
    public void userClicksOnBrowseTabOfCamelSpecificComponentPage() {
        camelBrowse = camelSpecificEndpointPage.browse();
    }

    @When("^User sends a predefined XML message with \"([^\"]*)\" header and \"([^\"]*)\" header's value$")
    public void userSendsJsonMessageOfUkOrderWithHeaderAndHeadersValue(String header, String valueOfHeader) {
        camelSend.addHeader(header, valueOfHeader)
            .writeBody(CAMEL_MOCK_ENDPOINT_MSG)
            .sendMessage()
            .successfulAlertMessage(CamelSend.class)
            .closeAlertMessage(CamelSend.class);
    }

    @Then("^The sent message with \"([^\"]*)\" id is presented$")
    public void theSentMessageWithIdIsLocatedOnBrowsePageOfEndpointOfContext(String messageId) {
        camelBrowse.openMessageById(messageId)
            .checkMessageById(messageId)
            .closeMessage();
    }

    @When("^User forwards \"([^\"]*)\" message to \"([^\"]*)\" Endpoint$")
    public void userForwardsSpecificMessageToSpecificEndpoint(String messageName, String endpoint) {
        camelBrowse.selectByName(messageName)
            .forward()
            .setUri(endpoint)
            .submit()
            .successfulAlertMessage(CamelBrowse.class)
            .closeAlertMessage(CamelBrowse.class);
    }
}
