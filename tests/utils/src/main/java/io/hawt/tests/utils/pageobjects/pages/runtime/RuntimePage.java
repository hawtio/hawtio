package io.hawt.tests.utils.pageobjects.pages.runtime;

import io.hawt.tests.utils.pageobjects.fragments.runtime.tabs.RuntimeMetrics;
import io.hawt.tests.utils.pageobjects.fragments.runtime.tabs.RuntimeSystemProperties;
import io.hawt.tests.utils.pageobjects.fragments.runtime.tabs.RuntimeThreads;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

public class RuntimePage extends HawtioPage {
    public RuntimeSystemProperties systemProperties() {
        return openTab("System Properties", RuntimeSystemProperties.class);
    }

    public RuntimeMetrics metrics() {
        return openTab("Metrics", RuntimeMetrics.class);
    }

    public RuntimeThreads threads() {
        return openTab("Threads", RuntimeThreads.class);
    }
}
