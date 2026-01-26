package io.hawt.tests.features.hooks;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.hawt.tests.features.config.TestConfiguration;
import io.hawt.tests.features.setup.LoginLogout;
import io.hawt.tests.features.setup.deployment.OpenshiftDeployment;
import org.junit.jupiter.api.Assumptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;

public class SkipTestsHook {

    private static final Logger LOG = LoggerFactory.getLogger(SkipTestsHook.class);

    @Before("@notHawtioNext")
    public void skipHawtioNextTests() {
        Assumptions.assumeTrue(System.getProperty("hawtio-next-ci") == null);
    }

    @Before("@notJBang")
    public void  skipNotJBangTests() {
        Assumptions.assumeTrue(System.getProperty("hawtio-jbang-ci") == null);
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

    @Before("@notKeycloak")
    public void skipKeycloakTests() {
        Assumptions.assumeFalse(TestConfiguration.useKeycloak());
    }

    @After("@throttling")
    public void afterThrottling(io.cucumber.java.Scenario scenario) {
        // Only re-login if the test actually ran (not skipped, not using Keycloak)
        boolean shouldReLogin = scenario.getStatus() != io.cucumber.java.Status.SKIPPED
            && !TestConfiguration.useKeycloak()
            && WebDriverRunner.hasWebDriverStarted();

        if (!shouldReLogin) {
            return;
        }

        try {
            while (WebDriverRunner.getWebDriver().getWindowHandles().size() != 1) {
                Selenide.closeWindow();
                Selenide.switchTo().window(0);
            }
            LoginLogout.login(TestConfiguration.getAppUsername(), TestConfiguration.getAppPassword());
        } catch (Exception e) {
            LOG.warn("Failed to re-login after throttling test", e);
        }
    }
}
