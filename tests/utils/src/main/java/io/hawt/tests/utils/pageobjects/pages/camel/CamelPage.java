package io.hawt.tests.utils.pageobjects.pages.camel;

import io.hawt.tests.utils.pageobjects.fragments.camel.CamelTree;
import io.hawt.tests.utils.pageobjects.pages.HawtioPage;

/**
 * Represents Camel page.
 */
public class CamelPage extends HawtioPage {
    private final CamelTree camelTree;

    public CamelPage() {
        camelTree = new CamelTree();
    }

    public CamelTree camelTree() {
        return camelTree;
    }
}
