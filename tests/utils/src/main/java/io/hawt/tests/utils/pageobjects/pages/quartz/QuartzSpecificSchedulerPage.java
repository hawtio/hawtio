package io.hawt.tests.utils.pageobjects.pages.quartz;

import io.hawt.tests.utils.pageobjects.fragments.quartz.tabs.QuartzJobs;
import io.hawt.tests.utils.pageobjects.fragments.quartz.tabs.QuartzScheduler;
import io.hawt.tests.utils.pageobjects.fragments.quartz.tabs.QuartzTriggers;

public class QuartzSpecificSchedulerPage extends QuartzPage {
    public QuartzScheduler scheduler() {
        return openTab("Scheduler", QuartzScheduler.class);
    }

    public QuartzTriggers triggers() {
        return openTab("Triggers", QuartzTriggers.class);
    }

    public QuartzJobs jobs() {
        return openTab("Jobs", QuartzJobs.class);
    }
}
