package io.hawt.tests.features.stepdefinitions.camel.routes;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelDebug;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelProperties;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelRouteDiagram;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelRoutes;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelSource;
import io.hawt.tests.features.pageobjects.fragments.camel.tabs.routes.CamelTrace;
import io.hawt.tests.features.setup.deployment.OpenshiftDeployment;

public class CamelRoutesStepDefs {
    private final CamelDebug camelDebug = new CamelDebug();
    private final CamelRoutes camelRoutes = new CamelRoutes();
    private final CamelRouteDiagram camelRouteDiagram = new CamelRouteDiagram();
    private final CamelSource camelSource = new CamelSource();
    private final CamelProperties camelProperties = new CamelProperties();
    private final CamelTrace camelTrace = new CamelTrace();

    @When("^User clicks on Delete button in dropdown in routes table$")
    public void userClicksOnDeleteButtonRoutesTable() {
        camelRoutes.delete();
    }

    @When("^User confirms deletion on Camel Routes page$")
    public void userConfirmsDeletionCamelContextsPage() {
        camelRoutes.confirm()
            .successfulAlertMessage()
            .closeAlertMessage();
    }

    @Then("^Camel Route diagram is presented$")
    public void camelRouteDiagramIsPresented() {
        camelRouteDiagram.diagramIsPresent();
    }

    @Then("^Route source code is presented$")
    public void routeSourceCodeIsPresented() {
        camelSource.routeSourceCodeIsPresented();
    }

    @Then("^Default quartz properties of \"([^\"]*)\" are Auto Startup: \"([^\"]*)\", Log Mask: \"([^\"]*)\", Delayer: \"([^\"]*)\"$")
    public void defaultQuartzPropertiesOfRouteAreAutoStartupLogMaskDelayer(String route, String autoStartup, String logMask, String delayer) {
        camelProperties.checkDefaultQuartzProperties(route, autoStartup, logMask, delayer);
    }

    @When("^User adds breakpoint on \"([^\"]*)\" node$")
    public void userAddsBreakpointOnNode(String node) {
        camelDebug.addBreakpoint(node);
    }

    @When("^User removes breakpoint on \"([^\"]*)\" node$")
    public void userRemovesBreakpointOnNode(String node) {
        camelDebug.removeBreakpoint(node);
    }

    @Then("^Breakpoint sign on \"([^\"]*)\" node is set: \"([^\"]*)\"$")
    public void breakpointSignIsSet(String node, String state) {
        camelDebug.breakpointSignIsSet(node, state);
    }

    @When("^User starts debugging$")
    public void userStartsDebugging() {
        camelDebug.startDebugging();
    }

    @Then("^Debugging is started$")
    public void debuggingIsStarted() {
        camelDebug.debuggingIsStarted();
    }

    @When("^User stops debugging$")
    public void userStopsDebugging() {
        camelDebug.stopDebugging();
    }

    @Then("^Start debugging option is presented$")
    public void startDebuggingOptionIsPresented() {
        if (TestConfiguration.getAppDeploymentMethod() instanceof OpenshiftDeployment && camelDebug.isDebuggingOn()) {
            camelDebug.stopDebugging();
        }
        camelDebug.startDebuggingOptionIsPresented();
    }

    @Then("^Nodes do not overlay$")
    public void nodesDoNotOverlay() {
        camelRouteDiagram.nodesDoNotOverlay();
    }

    @Then("^No node duplications exist$")
    public void noNodeDuplicationsExist() {
        camelRouteDiagram.noNodeDuplicationsExist();
    }

    @When("^User starts tracing$")
    public void startTrace() {
        camelTrace.startTracing();
    }

    @When("^User stops tracing$")
    public void stopTrace() {
        camelTrace.stopTracing();
    }

    @Then("^Tracing shows trace$")
    public void traceTableIsShown() {
        camelTrace.traceTableIsShown();
    }

    @Then("^Tracing shows diagram$")
    public void traceDiagramIsShown() {
        camelTrace.traceDiagramIsShown();
    }

    @Then("^Tracing not shows trace$")
    public void traceTableIsntShown() {
        camelTrace.traceTableIsntShown();
    }

    @Then("^Tracing not shows diagram$")
    public void traceDiagramIsntShown() {
        camelTrace.traceDiagramIsntShown();
    }
}
