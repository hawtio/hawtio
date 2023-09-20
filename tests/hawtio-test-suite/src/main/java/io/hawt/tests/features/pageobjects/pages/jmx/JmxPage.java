package io.hawt.tests.features.pageobjects.pages.jmx;

import io.hawt.tests.features.pageobjects.fragments.Tree;
import io.hawt.tests.features.pageobjects.pages.HawtioPage;

/**
 * Represents JMX page.
 */
public class JmxPage extends HawtioPage {
    private final Tree tree;

    public JmxPage() {
        tree = new Tree();
    }

    public Tree tree() {
        return tree;
    }
}
