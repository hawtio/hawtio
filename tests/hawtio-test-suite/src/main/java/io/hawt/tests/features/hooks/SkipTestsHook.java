package io.hawt.tests.features.hooks;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.setup.LoginLogout;
import io.hawt.tests.features.setup.deployment.OpenshiftDeployment;
import org.junit.jupiter.api.Assumptions;

public class SkipTestsHook {

    @Before("@notHawtioNext")
    public void skipHawtioNextTests() {
        Assumptions.assumeTrue(System.getProperty("hawtio-next-ci") == null);
    }

    @Before("@quarkus")
    public void skipQuarkus() {
        Assumptions.assumeTrue(TestConfiguration.isQuarkus());
    }

    @Before("@springboot")
    public void skipSB() {
        Assumptions.assumeTrue(TestConfiguration.isSpringboot());
    }

    @Before("@notOnline")
    public void skipOnlineTests() {
        Assumptions.assumeFalse(TestConfiguration.getAppDeploymentMethod() instanceof OpenshiftDeployment);
    }

    @Before("@online")
    public void skipTestsNotOnOnline() {
        Assumptions.assumeTrue(TestConfiguration.getAppDeploymentMethod() instanceof OpenshiftDeployment);
    }

    @After("@throttling")
    public void afterThrottling() {
        LoginLogout.login(TestConfiguration.getAppUsername(), TestConfiguration.getAppPassword());
    }


}
