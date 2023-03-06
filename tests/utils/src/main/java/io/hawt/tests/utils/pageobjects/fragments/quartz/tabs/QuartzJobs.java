package io.hawt.tests.utils.pageobjects.fragments.quartz.tabs;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.page;
import io.hawt.tests.utils.pageobjects.fragments.Table;
import io.hawt.tests.utils.pageobjects.fragments.quartz.dialog.QuartzJobDataMapDetailDialog;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class QuartzJobs extends HawtioPage {
    private static final Table table = new Table();

    /**
     * Open detail dialog of specified job by job name.
     *
     * @param jobName of detail dialog to be open
     * @return quartz job data map detail dialog
     */
    public QuartzJobDataMapDetailDialog openJobDataMapDetailsDialogByJobName(String jobName) {
        table.getRowByValue(jobName).shouldBe(visible).click();
        return page(QuartzJobDataMapDetailDialog.class);
    }
}
