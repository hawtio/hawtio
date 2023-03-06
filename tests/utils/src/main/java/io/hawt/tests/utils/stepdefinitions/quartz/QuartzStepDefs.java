package io.hawt.tests.utils.stepdefinitions.quartz;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.hawt.tests.utils.pageobjects.fragments.quartz.dialog.QuartzJobDataMapDetailDialog;
import io.hawt.tests.utils.pageobjects.fragments.quartz.tabs.QuartzJobs;
import io.hawt.tests.utils.pageobjects.fragments.quartz.tabs.QuartzScheduler;
import io.hawt.tests.utils.pageobjects.fragments.quartz.tabs.QuartzTriggers;
import io.hawt.tests.utils.pageobjects.pages.quartz.QuartzPage;
import io.hawt.tests.utils.pageobjects.pages.quartz.QuartzSpecificSchedulerPage;

public class QuartzStepDefs {
    private final QuartzPage quartzPage = new QuartzPage();
    private QuartzSpecificSchedulerPage quartzSpecificSchedulerPage;
    private QuartzScheduler quartzScheduler;
    private QuartzTriggers quartzTriggers;
    private QuartzJobs quartzJobs;
    private QuartzJobDataMapDetailDialog quartzJobDataMapDetailDialog;

    @And("^User is on Quartz \"([^\"]*)\" scheduler$")
    public void userIsOnQuartzSchedulerScheduler(String scheduler) {
        quartzSpecificSchedulerPage = quartzPage.quartzTree().expandSpecificScheduler(QuartzSpecificSchedulerPage.class, scheduler);
    }

    @And("^User clicks on Scheduler tab of Quartz Specific Scheduler page$")
    public void userClicksOnSchedulerTabOfQuartzSpecificSchedulerPage() {
        quartzScheduler = quartzSpecificSchedulerPage.scheduler();
    }

    @And("^User clicks on Triggers tab of Quartz Specific Scheduler page$")
    public void userClicksOnTriggersTabOfQuartzSpecificSchedulerPage() {
        quartzTriggers = quartzSpecificSchedulerPage.triggers();
    }

    @And("^User clicks on Jobs tab of Quartz Specific Scheduler page$")
    public void userClicksOnJobsTabOfQuartzSpecificSchedulerPage() {
        quartzJobs = quartzSpecificSchedulerPage.jobs();
    }

    @Then("^Info status is presented$")
    public void infoStatusIsPresented() {
        quartzScheduler.checkInfoStatusIsPresented();
    }

    @When("^User \"([^\"]*)\" the \"([^\"]*)\" on Quartz Scheduler page$")
    public void userInteractWithField(String action, String field) {
        quartzScheduler.actionField(action, field);
    }

    @Then("^The \"([^\"]*)\" field is \"([^\"]*)\"$")
    public void theSchedulerIs(String field, String status) {
        quartzScheduler.fieldIsInState(field, status);
    }

    @When("^User opens Job DataMap details dialog with name \"([^\"]*)\"$")
    public void userOpensJobDataMapDetailsDialogWithName(String jobName) {
        quartzJobDataMapDetailDialog = quartzJobs.openJobDataMapDetailsDialogByJobName(jobName);
    }

    @Then("^Key \"([^\"]*)\" has \"([^\"]*)\" value in Job DataMap details dialog$")
    public void keyHasValueInJobDataMapDetailsDialog(String key, String value) {
        quartzJobDataMapDetailDialog.checkKeyValue(key, value).closeTheDetailDialog();
    }

    @Then("^Quartz Triggers table with \"([^\"]*)\" column is presented$")
    public void quartzTriggersTableWithColumnIsPresented(String column) {
        quartzTriggers.checkTableNotEmpty(column);
    }
}
