package io.hawt.tests.features.stepdefinitions.camel.endpoints;

import io.cucumber.java.en.When;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.endpoints.CamelEndpoints;

public class CamelEndpointsStepDefs {
    private final CamelEndpoints camelEndpoints = new CamelEndpoints();

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
}
