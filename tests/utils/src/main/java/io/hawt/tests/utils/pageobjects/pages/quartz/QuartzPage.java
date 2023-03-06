package io.hawt.tests.utils.pageobjects.pages.quartz;

import io.hawt.tests.utils.pageobjects.fragments.quartz.QuartzTree;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class QuartzPage extends HawtioPage {
    private final QuartzTree quartzTree;

    public QuartzPage() {
        quartzTree = new QuartzTree();
    }

    public QuartzTree quartzTree() {
        return quartzTree;
    }
}
