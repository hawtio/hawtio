package io.hawt.tests.utils.stepdefinitions.runtime;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.runtime.dialog.RuntimeThreadDetailDialog;
import io.hawt.tests.utils.pageobjects.fragments.runtime.tabs.RuntimeMetrics;
import io.hawt.tests.utils.pageobjects.fragments.runtime.tabs.RuntimeSystemProperties;
import io.hawt.tests.utils.pageobjects.fragments.runtime.tabs.RuntimeThreads;
import io.hawt.tests.utils.pageobjects.pages.runtime.RuntimePage;

public class RuntimeStepDefs {
    private final RuntimePage runtimePage = new RuntimePage();
    private RuntimeSystemProperties runtimeSystemProperties;
    private RuntimeMetrics runtimeMetrics;
    private RuntimeThreads runtimeThreads;
    private RuntimeThreadDetailDialog runtimeThreadDetailDialog;

    @And("^User is on System Properties tab of Runtime page$")
    public void userIsOnSystemPropertiesTabOfRuntimePage() {
        runtimeSystemProperties = runtimePage.systemProperties();
    }

    @And("^User is on Metrics tab of Runtime page$")
    public void userIsOnMetricsTabOfRuntimePage() {
        runtimeMetrics = runtimePage.metrics();
    }

    @And("^User is on Threads tab of Runtime page$")
    public void userIsOnThreadsTabOfRuntimePage() {
        runtimeThreads = runtimePage.threads();
    }

    @When("^User checks metric with name \"([^\"]*)\"$")
    public void userChecksMetrics(String metricName) {
        runtimeMetrics.checkMetricIsPresented(metricName);
    }

    @Then("^Data of metric with name \"([^\"]*)\" is presented$")
    public void dataOfMetricIsPresented(String metricName) {
        runtimeMetrics.checkMetricHasData(metricName);
    }

    @When("^User opens Thread Detail dialog of row \"([^\"]*)\" from the table$")
    public void userOpensThreadDetailDialogOfSpecificRowFromTable(int row) {
        runtimeThreadDetailDialog = runtimeThreads.openThreadDetailDialog(row);
    }

    @Then("^Thread of row \"([^\"]*)\" from the table has the same ID and Name in Thread Detail dialog$")
    public void threadFromTableHasTheSameIdAndNameInDetailDialog(int row) {
        final String selectedThreadId = runtimeThreads.getIdOfThreadOnRowPosition(row);
        final String selectedThreadName = runtimeThreads.getNameOfThreadOnRowPosition(row);
        runtimeThreadDetailDialog.checkID(selectedThreadId).checkName(selectedThreadName).closeTheLogDialog();
    }
}
