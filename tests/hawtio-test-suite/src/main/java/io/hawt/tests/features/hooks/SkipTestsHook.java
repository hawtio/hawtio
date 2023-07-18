package io.hawt.tests.features.hooks;

import org.junit.jupiter.api.Assumptions;

import io.cucumber.java.Before;

public class SkipTestsHook {

    @Before("@notHawtioNext")
    public void skipHawtioNextTests() {
        Assumptions.assumeTrue(System.getProperty("hawtio-next-ci") == null);
    }

}
